from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    SignupSerializer, CustomTokenObtainPairSerializer, UserSerializer,
    AdminUserSerializer, RoleSerializer,
)
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import Role

class CustomTokenObtainPairView(TokenObtainPairView):
    """Use the custom serializer that adds user info to the response."""
    serializer_class = CustomTokenObtainPairSerializer

class SignupView(APIView):
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

# ==========================================
# EXAMPLE VIEWS FOR ROLE-BASED PERMISSIONS
# ==========================================

from .permissions import IsApplicant, IsRecruiter, IsAdmin, RolePermission

class ResumeUploadView(APIView):
    """Example: Only Applicants can upload resumes."""
    permission_classes = [IsAuthenticated, IsApplicant]

    def post(self, request):
        return Response({"message": f"Resume uploaded successfully by {request.user.email}"}, status=status.HTTP_200_OK)


class AdminDashboardView(APIView):
    """Example: Only Admins can access this view."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({"message": "Welcome to the Admin Dashboard!"}, status=status.HTTP_200_OK)


class FlexibleRoleView(APIView):
    """Example: Using the generic RolePermission for multiple roles."""
    permission_classes = [IsAuthenticated, RolePermission]
    allowed_roles = ['recruiter', 'admin']

    def get(self, request):
        return Response({"message": "This is accessible by Recruiters and Admins."}, status=status.HTTP_200_OK)


# ============================================================
# ADMIN — USER MANAGEMENT
# ============================================================

User = get_user_model()


class AdminUserListCreateView(APIView):
    """GET all users / POST create a user — admin only."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.select_related('role_fk', 'company').order_by('id')
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