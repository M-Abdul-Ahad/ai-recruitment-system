from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import SignupSerializer, CustomTokenObtainPairSerializer, UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

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