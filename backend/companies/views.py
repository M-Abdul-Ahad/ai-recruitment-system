from __future__ import annotations

from typing import TYPE_CHECKING, cast

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from users.permissions import RolePermission
from .models import Company
from .serializers import CompanySerializer, CompanyCreateSerializer, AddHRSerializer, CompanyMemberSerializer
from django.contrib.auth import get_user_model

if TYPE_CHECKING:
    from users.models import User

_User = get_user_model()


class CompanyCreateView(APIView):
    """
    POST /api/companies/register/

    Only Recruiter or Admin can create a company.
    Automatically assigns the created company to the requesting user.
    """

    permission_classes = [IsAuthenticated, RolePermission]
    allowed_roles = ["recruiter", "company_admin", "admin"]

    def post(self, request):
        user = cast("User", request.user)

        # Prevent recruiter/company_admin who already has a company from creating another
        if user.role in ["recruiter", "company_admin"] and user.company is not None:
            return Response(
                {"error": "You already belong to a company."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CompanyCreateSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            company = serializer.save()

            # Assign created company to the user
            user.company = company
            user.is_hr = True
            user.save(update_fields=["company", "is_hr"])

            return Response(
                CompanySerializer(company).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddHRView(APIView):
    """
    POST /api/companies/add-hr/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not (cast("User", request.user).role == "admin" or getattr(request.user, "is_hr", False)):
            return Response({"detail": "Permission denied. Must be HR or Admin."}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = AddHRSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            user_id = serializer.validated_data["user_id"]
            user = cast("User", _User.objects.get(id=user_id))
            user.is_hr = True
            user.save(update_fields=["is_hr"])
            return Response({"detail": "HR added successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RemoveHRView(APIView):
    """
    POST /api/companies/remove-hr/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        req_user = cast("User", request.user)
        if not (req_user.role == "admin" or req_user.is_hr):
            return Response({"detail": "Permission denied. Must be HR or Admin."}, status=status.HTTP_403_FORBIDDEN)
            
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"user_id": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = cast("User", _User.objects.get(id=user_id))
        except _User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if user.company != req_user.company and req_user.role != "admin":
            return Response({"detail": "User must belong to your company."}, status=status.HTTP_400_BAD_REQUEST)
            
        if not getattr(user, 'is_hr', False):
            return Response({"detail": "User is not HR."}, status=status.HTTP_400_BAD_REQUEST)
            
        if user == request.user:
            return Response({"detail": "Cannot remove yourself as HR."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.is_hr = False
        user.save(update_fields=["is_hr"])
        return Response({"detail": "HR removed successfully."}, status=status.HTTP_200_OK)

class HRListView(APIView):
    """
    GET /api/companies/hr-list/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        req_user = cast("User", request.user)
        if not req_user.company:
            return Response({"detail": "You do not belong to any company."}, status=status.HTTP_400_BAD_REQUEST)

        hrs = _User.objects.filter(company=req_user.company, is_hr=True)
        data = [{"id": hr.id, "email": cast("User", hr).email, "username": cast("User", hr).username} for hr in hrs]
        return Response(data, status=status.HTTP_200_OK)


class CompanyDetailView(APIView):
    """
    GET /api/companies/me/

    Returns the logged-in user's company.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = cast("User", request.user)

        if user.role == "applicant":
            return Response(
                {"error": "Applicants cannot access company data."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not user.company:
            return Response(
                {"error": "You do not belong to any company."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CompanySerializer(user.company)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CompanyMembersView(APIView):
    """
    GET /api/companies/members/
    
    Returns all users belonging to the logged-in user's company.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = cast("User", request.user)

        if user.role == "applicant":
            return Response(
                {"error": "Applicants cannot access company data."},
                status=status.HTTP_403_FORBIDDEN,
            )
            
        if not user.company:
            return Response(
                {"error": "You do not belong to any company."},
                status=status.HTTP_404_NOT_FOUND,
            )
            
        members = _User.objects.filter(company=user.company)
        serializer = CompanyMemberSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
