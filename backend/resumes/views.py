import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from .models import Resume
from .serializers import ResumeDetailSerializer, ResumeUploadSerializer
from .utils import (
    extract_text_from_pdf,
    extract_text_from_docx,
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
