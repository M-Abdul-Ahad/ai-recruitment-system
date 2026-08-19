from __future__ import annotations

from typing import TYPE_CHECKING, cast

import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger("companies.views")

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


class DeleteMemberView(APIView):
    """
    DELETE /api/companies/members/<int:pk>/
    
    Deletes a recruiter/team member from the database.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        req_user = cast("User", request.user)

        if req_user.role == "applicant":
            return Response(
                {"error": "Applicants cannot perform this action."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not req_user.company:
            return Response(
                {"error": "You do not belong to any company."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not (req_user.role in ["company_admin", "admin"] or req_user.is_hr):
            return Response(
                {"detail": "Permission denied. Must be HR or Admin."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if req_user.id == pk:
            return Response(
                {"detail": "Cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target_user = cast("User", _User.objects.get(pk=pk))
        except _User.DoesNotExist:
            return Response(
                {"detail": "Recruiter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if target_user.company != req_user.company and req_user.role != "admin":
            return Response(
                {"detail": "User does not belong to your company."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_user.delete()
        return Response({"detail": "Recruiter deleted successfully."}, status=status.HTTP_200_OK)



import hashlib
from django.utils import timezone
from .models import RecruiterInvitation
from .serializers import (
    RecruiterInvitationCreateSerializer,
    RecruiterInvitationListSerializer,
    AcceptInvitationSerializer,
)


class RecruiterInvitationView(APIView):
    """
    GET /api/companies/invitations/ -> list pending/historical recruiter invitations
    POST /api/companies/invitations/ -> create and send recruiter invitation
    """
    permission_classes = [IsAuthenticated, RolePermission]
    allowed_roles = ["company_admin", "admin"]

    def get(self, request):
        user = cast("User", request.user)
        if not user.company:
            return Response({"error": "You do not belong to any company."}, status=status.HTTP_400_BAD_REQUEST)

        invitations = RecruiterInvitation.objects.filter(company=user.company).order_by("-created_at")
        serializer = RecruiterInvitationListSerializer(invitations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = cast("User", request.user)
        if not user.company:
            return Response({"error": "You do not belong to any company."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RecruiterInvitationCreateSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            invitation = serializer.save()
            data = RecruiterInvitationListSerializer(invitation).data
            data["email_sent"] = getattr(invitation, "email_sent", True)
            data["email_error"] = getattr(invitation, "email_error", None)
            return Response(
                data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class RevokeInvitationView(APIView):
    """
    DELETE /api/companies/invitations/<int:pk>/ -> revoke pending recruiter invitation
    """
    permission_classes = [IsAuthenticated, RolePermission]
    allowed_roles = ["company_admin", "admin"]

    def delete(self, request, pk):
        user = cast("User", request.user)
        if not user.company:
            return Response({"error": "You do not belong to any company."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            invitation = RecruiterInvitation.objects.get(pk=pk, company=user.company, accepted_at__isnull=True)
        except RecruiterInvitation.DoesNotExist:
            return Response({"detail": "Pending invitation not found."}, status=status.HTTP_404_NOT_FOUND)

        invitation.delete()
        return Response({"detail": "Invitation revoked successfully."}, status=status.HTTP_200_OK)


class VerifyInvitationView(APIView):
    """
    GET /api/companies/invitations/verify/?token=<raw_token> -> verify token status
    """
    permission_classes = []

    def get(self, request):
        raw_token = request.query_params.get("token", "")
        if not raw_token:
            logger.warning("[VerifyInvitation] Missing token parameter in request.")
            return Response({"detail": "Token parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        invitation = RecruiterInvitation.objects.filter(token_hash=token_hash).first()

        if not invitation:
            logger.warning("[VerifyInvitation] Invalid token attempt.")
            return Response({"detail": "Invalid invitation token."}, status=status.HTTP_404_NOT_FOUND)

        if invitation.accepted_at is not None:
            logger.info("[VerifyInvitation] Already accepted invitation for %s.", invitation.email)
            return Response({"detail": "This invitation has already been accepted."}, status=status.HTTP_400_BAD_REQUEST)

        if invitation.expires_at <= timezone.now():
            logger.info("[VerifyInvitation] Expired invitation token for %s.", invitation.email)
            return Response({"detail": "This invitation link has expired."}, status=status.HTTP_400_BAD_REQUEST)

        logger.info("[VerifyInvitation] Valid token verified for %s (company: %s).", invitation.email, invitation.company.name)
        return Response(
            {
                "valid": True,
                "email": invitation.email,
                "company_name": invitation.company.name,
                "expires_at": invitation.expires_at,
            },
            status=status.HTTP_200_OK,
        )


class AcceptInvitationView(APIView):
    """
    POST /api/companies/invitations/accept/ -> set password & create recruiter user account
    """
    permission_classes = []

    def post(self, request):
        logger.debug("[AcceptInvitation] Received account setup payload.")
        serializer = AcceptInvitationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info("[AcceptInvitation] Recruiter account created for %s (role: %s, company_id: %s).", user.email, user.role, user.company_id)
            return Response(
                {
                    "message": "Recruiter account created successfully! You may now log in.",
                    "email": user.email,
                    "username": user.username,
                    "role": user.role,
                },
                status=status.HTTP_201_CREATED,
            )
        logger.warning("[AcceptInvitation] Account creation validation failed: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

