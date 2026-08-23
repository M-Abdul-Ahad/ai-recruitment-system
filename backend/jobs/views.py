from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Job, JobApplication, Skill
from .serializers import (
    JobSerializer, JobListSerializer, JobDetailSerializer,
    JobApplicationSerializer, RecruiterApplicationSerializer, SkillSerializer,
)
from .permissions import IsRecruiter, IsJobOwner, IsApplicant
from django.contrib.auth import get_user_model
from .services.gemini_jd_service import generate_job_description
import hashlib
from django.db import transaction, IntegrityError


User = get_user_model()


from django.db import transaction
from resumes.models import Resume


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]


class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Job.objects.none()

        # If user is recruiter -> return only their jobs
        if user.role == User.Role.RECRUITER:
            return Job.objects.filter(created_by=user)

        # If user is applicant -> return only ACTIVE jobs
        if user.role == User.Role.APPLICANT:
            return Job.objects.filter(status=Job.JobStatus.ACTIVE)

        # For Admin or other roles, return all jobs
        return Job.objects.all()

    def get_serializer_class(self):
        """Use applicant-specific serializers for list/retrieve when user is an applicant."""
        user = self.request.user
        if user.is_authenticated and user.role == User.Role.APPLICANT:
            if self.action == 'list':
                return JobListSerializer
            if self.action == 'retrieve':
                return JobDetailSerializer
        return JobSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            # Create -> only recruiters
            permission_classes = [permissions.IsAuthenticated, IsRecruiter]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Update/Delete -> only job owner (who is also a recruiter)
            permission_classes = [permissions.IsAuthenticated, IsRecruiter, IsJobOwner]
        else:
            # Read -> allowed to all authenticated users
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Automatically assign created_by and company from the request user.
        Do NOT accept these fields from request body.
        """
        serializer.save(
            created_by=self.request.user,
            company=self.request.user.company
        )

    @action(detail=False, methods=["post"], url_path="generate-jd", permission_classes=[permissions.IsAuthenticated, IsRecruiter])
    def generate_jd(self, request):
        try:
            generated_jd = generate_job_description(request.data)
            return Response({"generated_jd": generated_jd}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsRecruiter, IsJobOwner])
    def publish(self, request, pk=None):
        job = self.get_object()
        if job.status != Job.JobStatus.DRAFT:
            return Response({"error": "Only DRAFT jobs can be published."}, status=status.HTTP_400_BAD_REQUEST)

        if not job.title.strip():
            return Response(
                {"error": "Job title cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(job.description.strip()) < 50:
            return Response(
                {"error": "Job description must be at least 50 characters long."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not job.skills.exists():
            return Response(
                {"error": "Add at least one skill before publishing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        job.status = Job.JobStatus.ACTIVE
        job.save()
        return Response(JobSerializer(job).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsRecruiter, IsJobOwner])
    def close(self, request, pk=None):
        job = self.get_object()
        if job.status != Job.JobStatus.ACTIVE:
            return Response({"error": "Only ACTIVE jobs can be closed."}, status=status.HTTP_400_BAD_REQUEST)

        job.status = Job.JobStatus.CLOSED
        job.save()
        return Response(JobSerializer(job).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsApplicant])
    def apply(self, request, pk=None):
        job = self.get_object()

        if job.status in [Job.JobStatus.DRAFT, Job.JobStatus.CLOSED]:
            return Response({"error": "You cannot apply to this job."}, status=status.HTTP_400_BAD_REQUEST)

        if JobApplication.objects.filter(job=job, applicant=request.user).exists():
            return Response({"error": "You have already applied to this job."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = JobApplicationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        serializer.save(job=job, applicant=request.user, source_type=JobApplication.SourceType.APPLICATION)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="bulk-upload-resumes", permission_classes=[permissions.IsAuthenticated, IsRecruiter, IsJobOwner])
    def bulk_upload_resumes(self, request, pk=None):
        job = self.get_object()

        # Support 'files', 'resumes', or 'file' keys in multipart request
        files = request.FILES.getlist('files') or request.FILES.getlist('resumes') or request.FILES.getlist('file')
        if not files:
            return Response(
                {"error": "No resume files provided. Upload files under the 'files' or 'resumes' key."},
                status=status.HTTP_400_BAD_REQUEST
            )

        allowed_extensions = ('.pdf', '.docx')
        max_file_size = 10 * 1024 * 1024  # 10 MB per file limit

        # ── Phase 1: validate format/size & compute SHA-256 hash ──────────────
        staged = []   # list of dicts: {file_obj, file_hash}
        errors = []   # per-file validation failures reported to caller

        for file_obj in files:
            file_name = file_obj.name.lower()
            if not file_name.endswith(allowed_extensions):
                errors.append(f"{file_obj.name}: Only PDF and DOCX files are allowed.")
                continue
            if file_obj.size > max_file_size:
                errors.append(f"{file_obj.name}: File size exceeds 10MB limit.")
                continue

            # Compute SHA-256 over the entire file content
            hasher = hashlib.sha256()
            for chunk in file_obj.chunks():
                hasher.update(chunk)
            file_hash = hasher.hexdigest()
            # Seek back so Django can save the file later
            file_obj.seek(0)

            staged.append({"file_obj": file_obj, "file_hash": file_hash})

        if not staged:
            return Response({"error": "No valid files to process.", "details": errors}, status=status.HTTP_400_BAD_REQUEST)

        # ── Phase 2: create records (one transaction per file for granular errors) ──
        created_applications = []

        for item in staged:
            file_obj = item["file_obj"]
            file_hash = item["file_hash"]

            try:
                with transaction.atomic():
                    # 2a. Reuse an existing Resume with the same hash to avoid
                    #     storing duplicate files on disk.
                    existing_resume = Resume.objects.filter(file_hash=file_hash).first()

                    if existing_resume is not None:
                        resume = existing_resume
                    else:
                        resume = Resume.objects.create(
                            user=None,
                            file=file_obj,
                            file_hash=file_hash,
                        )

                    # 2b. Guard: same resume already linked to this job?
                    if JobApplication.objects.filter(job=job, resume=resume).exists():
                        errors.append(
                            f"{file_obj.name}: This resume has already been uploaded for this job."
                        )
                        continue

                    # 2c. Create the JobApplication
                    app = JobApplication.objects.create(
                        job=job,
                        applicant=None,
                        resume=resume,
                        source_type=JobApplication.SourceType.RECRUITER_UPLOAD,
                        status=JobApplication.ApplicationStatus.APPLIED,
                    )
                    created_applications.append(app)

            except IntegrityError:
                # Catch race-condition duplicates at the DB level
                errors.append(
                    f"{file_obj.name}: This resume has already been uploaded for this job."
                )

        primary_error = None
        if errors and not created_applications:
            primary_error = errors[0]
        elif errors:
            primary_error = f"{len(errors)} file(s) failed or were duplicates."

        response_status = status.HTTP_201_CREATED if created_applications else status.HTTP_400_BAD_REQUEST
        serializer = RecruiterApplicationSerializer(created_applications, many=True)
        return Response({
            "message": (
                f"Successfully imported {len(created_applications)} candidate resume(s)."
                if created_applications
                else "No resumes were imported."
            ),
            "error": primary_error,
            "count": len(created_applications),
            "errors": errors if errors else None,
            "applications": serializer.data
        }, status=response_status)

    @action(detail=False, methods=["get"], url_path="my-applications", permission_classes=[permissions.IsAuthenticated, IsApplicant])
    def my_applications(self, request):
        """GET /api/jobs/my-applications/ → logged-in applicant's applications."""
        applications = JobApplication.objects.filter(applicant=request.user).select_related('job', 'job__company', 'resume')
        serializer = JobApplicationSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated, IsRecruiter, IsJobOwner])
    def applications(self, request, pk=None):
        job = self.get_object()
        applications = job.applications.select_related('applicant', 'resume').all()
        return Response(RecruiterApplicationSerializer(applications, many=True).data)

    @action(detail=True, methods=["patch"], url_path='applications/(?P<app_id>[^/.]+)', permission_classes=[permissions.IsAuthenticated, IsRecruiter, IsJobOwner])
    def update_application_status(self, request, pk=None, app_id=None):
        job = self.get_object()
        try:
            application = job.applications.get(id=app_id)
        except JobApplication.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if new_status:
            valid_statuses = [choice[0] for choice in JobApplication.ApplicationStatus.choices]
            if new_status not in valid_statuses:
                return Response({"error": f"Invalid status. Choose from {valid_statuses}."}, status=status.HTTP_400_BAD_REQUEST)
            application.status = new_status

        # Allow recruiter to update notes and tags
        recruiter_notes = request.data.get("recruiter_notes")
        if recruiter_notes is not None:
            application.recruiter_notes = recruiter_notes

        tags = request.data.get("tags")
        if tags is not None and isinstance(tags, list):
            application.tags = tags

        application.save()
        return Response(RecruiterApplicationSerializer(application).data)

    @action(
        detail=True,
        methods=["delete"],
        url_path=r'applications/(?P<app_id>[^/.]+)/remove',
        permission_classes=[permissions.IsAuthenticated, IsRecruiter, IsJobOwner],
    )
    def remove_candidate(self, request, pk=None, app_id=None):
        """
        DELETE /api/jobs/{job_id}/applications/{app_id}/remove/
        Removes a candidate's JobApplication from this job.
        - For RECRUITER_UPLOAD: also deletes the linked Resume + file
          IF that resume is not linked to any other job.
        - For APPLICATION: only the JobApplication is deleted; the
          applicant's Resume record is never touched.
        """
        job = self.get_object()  # enforces IsJobOwner
        try:
            application = job.applications.get(id=app_id)
        except JobApplication.DoesNotExist:
            return Response(
                {"error": "Application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        resume = application.resume
        is_recruiter_upload = application.source_type == JobApplication.SourceType.RECRUITER_UPLOAD

        with transaction.atomic():
            application.delete()

            # Only clean up the Resume if it was recruiter-uploaded AND is now orphaned
            if is_recruiter_upload and resume is not None:
                still_linked = JobApplication.objects.filter(resume=resume).exists()
                if not still_linked:
                    # Delete the physical file from storage, then the DB row
                    if resume.file:
                        resume.file.delete(save=False)
                    resume.delete()

        return Response(
            {"message": "Candidate removed successfully."},
            status=status.HTTP_200_OK,
        )



# ============================================================
# ADMIN — JOB MANAGEMENT
# ============================================================
from rest_framework.views import APIView
from users.permissions import IsAdmin
from companies.models import Company


class AdminJobSerializer(JobSerializer):
    """JobSerializer variant that exposes company + created_by as writable for admin."""
    company_name = __import__('rest_framework.serializers', fromlist=['serializers']).CharField(
        source='company.name', read_only=True
    )

    class Meta(JobSerializer.Meta):
        fields = JobSerializer.Meta.fields + ['company_name']
        read_only_fields = ['created_at', 'updated_at']


class AdminJobListCreateView(APIView):
    """GET all jobs / POST create a job — admin only."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        jobs = Job.objects.select_related('company', 'created_by').prefetch_related('skills').order_by('-created_at')
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        # Admin must supply company + created_by
        serializer = JobSerializer(data=data)
        if serializer.is_valid():
            company_id = data.get('company')
            created_by_id = data.get('created_by')
            try:
                company = Company.objects.get(pk=company_id)
            except Company.DoesNotExist:
                return Response({'company': ['Company not found.']}, status=status.HTTP_400_BAD_REQUEST)
            try:
                created_by = User.objects.get(pk=created_by_id)
            except User.DoesNotExist:
                return Response({'created_by': ['User not found.']}, status=status.HTTP_400_BAD_REQUEST)
            job = serializer.save(company=company, created_by=created_by)
            return Response(JobSerializer(job).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminJobDetailView(APIView):
    """GET / PATCH / DELETE a single job — admin only."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def _get_job(self, pk):
        try:
            return Job.objects.select_related('company', 'created_by').prefetch_related('skills').get(pk=pk)
        except Job.DoesNotExist:
            return None

    def get(self, request, pk):
        job = self._get_job(pk)
        if job is None:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(JobSerializer(job).data)

    def patch(self, request, pk):
        job = self._get_job(pk)
        if job is None:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = JobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(JobSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        job = self._get_job(pk)
        if job is None:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
