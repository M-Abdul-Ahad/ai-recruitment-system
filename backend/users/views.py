from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import (
    SignupSerializer, CustomTokenObtainPairSerializer, UserSerializer,
    AdminUserSerializer, RoleSerializer, ProfileUpdateSerializer, ChangePasswordSerializer,
)
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from core.pagination import StandardResultsSetPagination
from .models import Role

class CustomTokenObtainPairView(TokenObtainPairView):
    """Use the custom serializer that adds user info to the response."""
    serializer_class = CustomTokenObtainPairSerializer

class SignupView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user_data = UserSerializer(user).data
            return Response({
                "message": "User created successfully",
                "user": user_data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TestAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "JWT is working!"})

from .permissions import IsApplicant, IsRecruiter, IsAdmin, RolePermission
# ==========================================

class UserProfileView(APIView):
    """GET and PATCH profile details for the authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/ to update user password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"old_password": ["Incorrect current password."]}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)


class AdminDashboardStatsView(APIView):
    """GET system-wide statistics for the Administrator portal."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from companies.models import Company
        from jobs.models import Job, JobApplication
        from resumes.models import Resume

        # Total counts
        total_users = User.objects.count()
        users_by_role = {
            "applicant": User.objects.filter(role=User.Role.APPLICANT).count(),
            "recruiter": User.objects.filter(role=User.Role.RECRUITER).count(),
            "company_admin": User.objects.filter(role=User.Role.COMPANY_ADMIN).count(),
            "admin": User.objects.filter(role=User.Role.ADMIN).count(),
        }

        total_companies = Company.objects.count()
        companies_by_status = {
            "verified": Company.objects.filter(verification_status=Company.VerificationStatus.VERIFIED).count(),
            "pending": Company.objects.filter(verification_status=Company.VerificationStatus.PENDING).count(),
            "rejected": Company.objects.filter(verification_status=Company.VerificationStatus.REJECTED).count(),
            "unverified": Company.objects.filter(verification_status=Company.VerificationStatus.UNVERIFIED).count(),
        }

        total_jobs = Job.objects.count()
        jobs_by_status = {
            "active": Job.objects.filter(status=Job.JobStatus.ACTIVE).count(),
            "draft": Job.objects.filter(status=Job.JobStatus.DRAFT).count(),
            "closed": Job.objects.filter(status=Job.JobStatus.CLOSED).count(),
        }

        total_applications = JobApplication.objects.count()
        total_resumes = Resume.objects.count()

        # Recent activities (recent users & recent companies)
        recent_users = User.objects.order_by("-date_joined")[:5].values(
            "id", "email", "username", "role", "date_joined"
        )
        recent_companies = Company.objects.order_by("-created_at")[:5].values(
            "id", "name", "email", "verification_status", "created_at"
        )

        return Response({
            "total_users": total_users,
            "users_by_role": users_by_role,
            "total_companies": total_companies,
            "companies_by_status": companies_by_status,
            "total_jobs": total_jobs,
            "jobs_by_status": jobs_by_status,
            "total_applications": total_applications,
            "total_resumes": total_resumes,
            "recent_users": list(recent_users),
            "recent_companies": list(recent_companies),
        }, status=status.HTTP_200_OK)


# ============================================================
# ADMIN — USER MANAGEMENT
# ============================================================

User = get_user_model()


class AdminUserListCreateView(APIView):
    """GET all users / POST create a user — admin only."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.select_related('role_fk', 'company').order_by('id')
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(users, request, view=self)
        if page is not None:
            serializer = AdminUserSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AdminUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserDetailView(APIView):
    """GET / PATCH / DELETE a single user — admin only."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def _get_user(self, pk):
        try:
            return User.objects.select_related('role_fk', 'company').get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self._get_user(pk)
        if user is None:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdminUserSerializer(user).data)

    def patch(self, request, pk):
        user = self._get_user(pk)
        if user is None:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(AdminUserSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = self._get_user(pk)
        if user is None:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        if user.pk == request.user.pk:
            return Response(
                {'error': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================
# ADMIN — ROLE MANAGEMENT
# ============================================================

class RoleListCreateView(APIView):
    """GET all roles / POST create a role — admin only."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        roles = Role.objects.all().order_by('id')
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = RoleSerializer(data=request.data)
        if serializer.is_valid():
            role = serializer.save()
            return Response(RoleSerializer(role).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoleDetailView(APIView):
    """GET / PATCH / DELETE a single role — admin only."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def _get_role(self, pk):
        try:
            return Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            return None

    def get(self, request, pk):
        role = self._get_role(pk)
        if role is None:
            return Response({'error': 'Role not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(RoleSerializer(role).data)

    def patch(self, request, pk):
        role = self._get_role(pk)
        if role is None:
            return Response({'error': 'Role not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RoleSerializer(role, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(RoleSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        role = self._get_role(pk)
        if role is None:
            return Response({'error': 'Role not found.'}, status=status.HTTP_404_NOT_FOUND)
        role.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)