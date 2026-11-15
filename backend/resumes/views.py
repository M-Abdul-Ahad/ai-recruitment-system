import os
import re

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.http import HttpResponse, Http404, FileResponse
import mimetypes
from core.r2_storage import get_r2_client, get_bucket_name, generate_r2_presigned_url

from .models import Resume
from .serializers import ResumeDetailSerializer, ResumeUploadSerializer
from .utils import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_contact_info,
    extract_projects,
)
from resumes.services.resume_parser import parse_and_store_resume_data
from .services.gemini_ai import generate_ai_resume_feedback


class ResumeUploadView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        file = request.FILES.get('file')

        # 1️⃣ Check file exists
        if not file:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2️⃣ Validate file type
        if not file.name.lower().endswith(('.pdf', '.docx')):
            return Response(
                {"error": "Only PDF and DOCX files are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3️⃣ Handle user safely
        current_user = request.user if request.user.is_authenticated else None

        # 4️⃣ Save resume file
        resume = Resume.objects.create(
            user=current_user,
            file=file
        )

        # 5️⃣ Extract raw text
        file_path = resume.file.path
        extension = os.path.splitext(file_path)[1].lower()

        if extension == '.pdf':
            extracted_text = extract_text_from_pdf(file_path)
        else:
            extracted_text = extract_text_from_docx(file_path)

        # 6️⃣ Save RAW extracted text (important)
        resume.extracted_text = extracted_text
        resume.save()

        # 🔥 7️⃣ Parse & store structured data (WEEK 3 CORE)
        parse_and_store_resume_data(resume)

        # 🧠 7.5️⃣ Auto-generate vector embedding (if GEMINI_EMBEDDING_API_KEY configured)
        try:
            from resumes.services.gemini_embedding import build_resume_embedding_text, generate_embedding
            resume.refresh_from_db()
            emb_text = build_resume_embedding_text(resume)
            embedding_vector = generate_embedding(emb_text)
            if embedding_vector:
                resume.embedding = embedding_vector
                resume.save(update_fields=['embedding'])
        except Exception:
            # Non-blocking fallback: normal upload succeeds even if embedding API key is not configured yet
            pass

        # 8️⃣ Return structured response
        serializer = ResumeDetailSerializer(resume)

        return Response(
            {
                "message": "Resume uploaded and parsed successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_ai_feedback(request, resume_id):
    try:
        # 1️⃣ Fetch resume
        resume = Resume.objects.get(id=resume_id)

        # 2️⃣ Build AI payload (STRUCTURE + TEXT)
        resume_data = {
            "skills": [s.name for s in resume.skills.all()],

            "education": [
                {
                    "degree": e.degree,
                    "institution": e.institution,
                    "year": e.year
                } for e in resume.education.all()
            ],

            "experience": [
                {
                    "job_title": exp.job_title,
                    "company": exp.company,
                    "duration": exp.duration,
                    "description": exp.description
                } for exp in resume.experience.all()
            ],

            # 🔥 Full semantic context
            "extracted_text": resume.extracted_text,
            "cleaned_text": resume.cleaned_text
        }

        # 3️⃣ Call Gemini AI
        ai_result = generate_ai_resume_feedback(resume_data)

        # 4️⃣ Save AI results in DB
        resume.ai_score = ai_result.get("score")
        resume.ai_feedback = ai_result.get("summary_feedback")
        resume.ai_strengths = ai_result.get("strengths")
        resume.ai_weaknesses = ai_result.get("weaknesses")
        resume.ai_suggestions = ai_result.get("suggestions")
        resume.ai_category_scores = ai_result.get("category_scores")
        resume.ai_recommended_certifications = ai_result.get("recommended_certifications")
        resume.save()

        # 5️⃣ Response
        return Response({
            "message": "AI feedback generated successfully",
            "data": ai_result
        }, status=status.HTTP_200_OK)

    except Resume.DoesNotExist:
        return Response({"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_resumes(request):
    """GET /api/resumes/my-resumes/ → list current user's resumes."""
    resumes = Resume.objects.filter(user=request.user).order_by('-uploaded_at')
    serializer = ResumeUploadSerializer(resumes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def latest_resume(request):
    """GET /api/resumes/latest/ → get the latest uploaded and parsed resume formatted for the resume builder."""
    resume = Resume.objects.filter(user=request.user).order_by('-uploaded_at').first()
    if not resume:
        # Fallback to the most recent uploaded resume in the system
        resume = Resume.objects.order_by('-uploaded_at').first()

    if not resume:
        return Response(
            {"error": "No resume found in the database. Please upload a resume in the Resume Analysis tab first."},
            status=status.HTTP_404_NOT_FOUND
        )


    # 1. Contact & Personal Info
    contact_data = extract_contact_info(resume.extracted_text) if resume.extracted_text else {}
    personal_info = {
        "fullName": contact_data.get("fullName") or request.user.get_full_name() or request.user.username or "",
        "email": contact_data.get("email") or request.user.email or "",
        "phone": contact_data.get("phone") or "",
        "location": "",
        "professionalTitle": contact_data.get("professionalTitle") or "",
        "linkedin": contact_data.get("linkedin") or "",
        "github": contact_data.get("github") or "",
        "portfolio": "",
    }

    # 2. Skills
    skills_list = [s.name for s in resume.skills.all()]

    # 3. Education
    education_list = [
        {
            "degree": e.degree,
            "institution": e.institution,
            "field": "",
            "location": "",
            "startDate": "",
            "endDate": e.year or "",
        }
        for e in resume.education.all()
    ]

    # 4. Experience
    experience_list = []
    for exp in resume.experience.all():
        desc = exp.description or ""
        raw_bullets = [b.strip() for b in re.split(r'[\n\r]+', desc) if b.strip()] if desc else []
        cleaned_bullets = [re.sub(r'^[-•*–>·]\s*', '', b).strip() for b in raw_bullets if b.strip()]
        # Remove empty or duplicate bullets while preserving order
        seen = set()
        final_bullets = []
        for b in cleaned_bullets:
            if b and b.lower() not in seen:
                seen.add(b.lower())
                final_bullets.append(b)

        experience_list.append({
            "company": exp.company or "",
            "position": exp.job_title or "",
            "location": "",
            "startDate": exp.duration or "",
            "endDate": "",
            "current": False,
            "bullets": final_bullets if final_bullets else ([desc] if desc else []),
        })


    # 5. Projects
    projects_list = extract_projects(resume.extracted_text) if resume.extracted_text else []

    builder_data = {
        "personal": personal_info,
        "summary": resume.ai_feedback or "",
        "education": education_list,
        "experience": experience_list,
        "skills": [{"category": "Technical & Professional Skills", "skills": skills_list}] if skills_list else [],
        "projects": projects_list,
        "certifications": [],
        "awards": [],
        "volunteerExperience": [],
        "languages": [],
        "memberships": [],
    }

    detail_data = ResumeDetailSerializer(resume).data

    return Response({
        "resume_id": resume.id,
        "uploaded_at": resume.uploaded_at,
        "builder_data": builder_data,
        "detail_data": detail_data,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tailor_resume_for_job(request):
    """
    AI-powered endpoint that tailors a resume (either provided in request or fetched from DB)
    to maximize ATS score and relevancy for a specific target job.
    """
    from jobs.models import Job
    from .services.gemini_ai import tailor_resume_for_job_ai

    job_id = request.data.get('job_id')
    custom_title = request.data.get('job_title', '').strip()
    custom_desc = request.data.get('job_description', '').strip()
    custom_reqs = request.data.get('requirements', '').strip()
    input_resume_data = request.data.get('resume_data')

    job_title = custom_title
    job_description = custom_desc
    requirements = custom_reqs

    if job_id:
        try:
            job = Job.objects.prefetch_related('skills').get(id=job_id)
            job_title = job.title
            job_description = job.description
            job_skills = ", ".join([s.name for s in job.skills.all()])
            requirements = f"Experience required: {job.experience_required} years. Key skills: {job_skills}"
        except Job.DoesNotExist:
            return Response(
                {"error": "Target job not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    if not job_title and not job_description:
        return Response(
            {"error": "Please provide a target job or job description to tailor the resume against."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # If user provided resume_data from their current builder state, use it
    # Otherwise fallback to their latest resume in database
    target_resume_data = input_resume_data
    if not target_resume_data or not (
        target_resume_data.get('experience') or
        target_resume_data.get('education') or
        target_resume_data.get('skills')
    ):
        resume = Resume.objects.filter(applicant=request.user).order_by('-uploaded_at').first()
        if not resume:
            return Response(
                {"error": "No resume data found to tailor. Please upload your resume or fill in your details first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        contact_data = extract_contact_info(resume.extracted_text) if resume.extracted_text else {}
        skills_list = [s.name for s in resume.skills.all()]
        education_list = [
            {
                "degree": e.degree,
                "institution": e.institution,
                "field": "",
                "location": "",
                "startDate": "",
                "endDate": e.year or "",
            }
            for e in resume.education.all()
        ]
        experience_list = []
        for exp in resume.experience.all():
            desc = exp.description or ""
            raw_bullets = [b.strip() for b in re.split(r'[\n\r]+', desc) if b.strip()] if desc else []
            cleaned_bullets = [re.sub(r'^[-•*–>·]\s*', '', b).strip() for b in raw_bullets if b.strip()]
            seen = set()
            final_bullets = [b for b in cleaned_bullets if b and b.lower() not in seen and not seen.add(b.lower())]
            experience_list.append({
                "company": exp.company or "",
                "position": exp.job_title or "",
                "location": "",
                "startDate": exp.duration or "",
                "endDate": "",
                "current": False,
                "bullets": final_bullets if final_bullets else ([desc] if desc else []),
            })

        projects_list = extract_projects(resume.extracted_text) if resume.extracted_text else []

        target_resume_data = {
            "personal": {
                "fullName": contact_data.get("full_name") or request.user.username or "",
                "email": contact_data.get("email") or request.user.email or "",
                "phone": contact_data.get("phone") or "",
                "address": contact_data.get("location") or "",
                "title": job_title or "Software Engineer",
                "linkedin": contact_data.get("linkedin") or "",
                "github": contact_data.get("github") or "",
                "portfolio": "",
            },
            "summary": resume.ai_feedback or "",
            "education": education_list,
            "experience": experience_list,
            "skills": [{"category": "Technical & Professional Skills", "skills": skills_list}] if skills_list else [],
            "projects": projects_list,
            "certifications": [],
            "awards": [],
            "volunteerExperience": [],
            "languages": [],
            "memberships": [],
        }

    try:
        tailored_data = tailor_resume_for_job_ai(
            resume_data=target_resume_data,
            job_title=job_title,
            job_description=job_description,
            requirements=requirements
        )

        return Response({
            "success": True,
            "job_title": job_title,
            "tailored_resume_data": tailored_data,
            "ats_notes": tailored_data.get("ats_optimization_notes", {})
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"AI ATS optimization failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stream_resume_document(request, resume_id):
    """
    GET /api/resumes/<resume_id>/stream/
    Securely streams resume bytes (PDF/DOCX) to authenticated clients:
    - If stored in Cloudflare R2, streams object bytes from R2 directly.
    - If stored in local MEDIA_ROOT, serves local file via FileResponse.
    - Supports inline preview and download with proper Content-Type & Content-Disposition.
    """
    try:
        resume = Resume.objects.get(id=resume_id)
    except Resume.DoesNotExist:
        return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)

    # Permission check: User can access if applicant owns it, or user is recruiter/company_admin/admin
    is_owner = resume.user == request.user
    is_staff_or_recruiter = getattr(request.user, "role", "") in ["recruiter", "company_admin", "admin"] or request.user.is_staff
    if not (is_owner or is_staff_or_recruiter):
        return Response({"error": "You do not have permission to view this resume."}, status=status.HTTP_403_FORBIDDEN)

    file_field = resume.file
    file_name = file_field.name or ""

    # Detect extension and content type
    content_type, _ = mimetypes.guess_type(file_name)
    if not content_type:
        content_type = "application/pdf" if file_name.lower().endswith(".pdf") else "application/octet-stream"

    filename_only = os.path.basename(file_name)

    # 1. Try local filesystem first if local file exists
    try:
        if file_field and hasattr(file_field, "path") and os.path.exists(file_field.path):
            resp = FileResponse(open(file_field.path, "rb"), content_type=content_type)
            resp["Content-Disposition"] = f'inline; filename="{filename_only}"'
            resp["Access-Control-Expose-Headers"] = "Content-Disposition, Content-Type, Content-Length"
            return resp
    except Exception:
        pass

    # 2. Try Cloudflare R2
    try:
        r2_key = file_name
        # In case the key is stored with leading slash
        if r2_key.startswith("/"):
            r2_key = r2_key[1:]

        client = get_r2_client()
        bucket = get_bucket_name()
        s3_obj = client.get_object(Bucket=bucket, Key=r2_key)
        file_bytes = s3_obj["Body"].read()

        response = HttpResponse(file_bytes, content_type=content_type)
        response["Content-Disposition"] = f'inline; filename="{filename_only}"'
        response["Content-Length"] = len(file_bytes)
        response["Access-Control-Expose-Headers"] = "Content-Disposition, Content-Type, Content-Length"
        return response
    except Exception as e:
        logger.error("Failed to stream resume #%s from R2 (%s): %s", resume_id, file_name, e)
        # 3. Fallback: Presigned URL redirect if direct byte read fails
        presigned = generate_r2_presigned_url(file_name)
        if presigned:
            from django.shortcuts import redirect
            return redirect(presigned)

        return Response(
            {"error": "Resume file could not be accessed from storage."},
            status=status.HTTP_404_NOT_FOUND,
        )



