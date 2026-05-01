from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Job, JobApplication, Skill
from .serializers import JobSerializer, JobApplicationSerializer, SkillSerializer
from .permissions import IsRecruiter, IsJobOwner, IsApplicant
from django.contrib.auth import get_user_model
from .services.gemini_jd_service import generate_job_description


User = get_user_model()


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

        application = JobApplication.objects.create(
            job=job,
            applicant=request.user
        )
        return Response(JobApplicationSerializer(application).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated, IsRecruiter, IsJobOwner])
    def applications(self, request, pk=None):
        job = self.get_object()
        applications = job.applications.all()
        return Response(JobApplicationSerializer(applications, many=True).data)

    @action(detail=True, methods=["patch"], url_path='applications/(?P<app_id>[^/.]+)', permission_classes=[permissions.IsAuthenticated, IsRecruiter, IsJobOwner])
    def update_application_status(self, request, pk=None, app_id=None):
        job = self.get_object()
        try:
            application = job.applications.get(id=app_id)
        except JobApplication.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        valid_statuses = [choice[0] for choice in JobApplication.ApplicationStatus.choices]
        if new_status not in valid_statuses:
            return Response({"error": f"Invalid status. Choose from {valid_statuses}."}, status=status.HTTP_400_BAD_REQUEST)

        application.status = new_status
        application.save()
        return Response(JobApplicationSerializer(application).data)
