from __future__ import annotations

from typing import TYPE_CHECKING, cast

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Company

if TYPE_CHECKING:
    from users.models import User
    from django.contrib.auth.models import UserManager  # for create_user typing

_User = get_user_model()


class CompanyMemberSerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore[override]
        model = _User
        fields = ["id", "username", "role", "is_hr"]


class CompanySerializer(serializers.ModelSerializer):
    """Read-only serializer for Company details."""
    recruiters = CompanyMemberSerializer(many=True, read_only=True)

    class Meta:  # type: ignore[override]
        model = Company
        fields = ["id", "name", "email", "description", "website", "industry", "phone", "address", "logo", "created_at", "updated_at", "recruiters"]
        read_only_fields = ["id", "name", "email", "description", "website", "industry", "phone", "address", "logo", "created_at", "updated_at", "recruiters"]


class CompanyCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new Company.

    Validation rules:
    - name must be unique (enforced by model + explicit check)
    - recruiter cannot already belong to a company
    - applicant cannot create a company
    """

    class Meta:  # type: ignore[override]
        model = Company
        fields = ["name", "email", "description", "website", "industry", "phone", "address", "logo"]

    def validate_name(self, value):
        if Company.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A company with this name already exists.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        if not request or not request.user:
            raise serializers.ValidationError("Authentication required.")

        user = cast("User", request.user)

        # Applicants cannot create companies
        if user.role == "applicant":
            raise serializers.ValidationError("Applicants cannot create a company.")

        # Recruiters who already have a company cannot create another
        if user.role == "recruiter" and user.company is not None:
            raise serializers.ValidationError("You already belong to a company.")

        return attrs


class AddHRSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        request = self.context.get("request")
        if not request or not getattr(request, 'user', None):
            raise serializers.ValidationError("Authentication required.")

        try:
            user = cast("User", _User.objects.get(id=value))
        except _User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        if user.role != "recruiter":
            raise serializers.ValidationError("Only recruiters can be HR.")

        req_user = cast("User", request.user)
        if req_user.role != "admin" and user.company != req_user.company:
            raise serializers.ValidationError("User must belong to your company.")

        if getattr(user, 'is_hr', False):
            raise serializers.ValidationError("User is already HR.")

        return value


import secrets
import hashlib
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from users.models import Role
from .models import RecruiterInvitation
from .email_utils import send_invitation_email


class RecruiterInvitationCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()

    class Meta:  # type: ignore[override]
        model = RecruiterInvitation
        fields = ["email"]

    def validate_email(self, value):
        email = value.lower().strip()
        request = self.context.get("request")
        if not request or not getattr(request, "user", None):
            raise serializers.ValidationError("Authentication required.")

        user = cast("User", request.user)
        if not user.company:
            raise serializers.ValidationError("You must belong to a company to invite recruiters.")

        if _User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email address is already registered.")

        if RecruiterInvitation.objects.filter(
            company=user.company,
            email__iexact=email,
            accepted_at__isnull=True,
            expires_at__gt=timezone.now(),
        ).exists():
            raise serializers.ValidationError("An active invitation has already been sent to this email address.")

        return email

    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not getattr(request, "user", None):
            raise serializers.ValidationError("Authentication required.")
        user = cast("User", request.user)

        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        expires_at = timezone.now() + timedelta(hours=48)

        company = user.company
        if company is None:
            raise serializers.ValidationError("You must belong to a company to invite recruiters.")

        invitation = RecruiterInvitation.objects.create(
            company=company,
            email=validated_data["email"],
            token_hash=token_hash,
            expires_at=expires_at,
            invited_by=user,
        )

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        setup_link = f"{frontend_url}/setup-password?token={raw_token}"

        email_sent, email_error = send_invitation_email(
            to_email=invitation.email,
            setup_link=setup_link,
            company_name=company.name,
            invited_by=user.username or user.email,
        )

        setattr(invitation, "email_sent", email_sent)
        setattr(invitation, "email_error", email_error)

        return invitation


class RecruiterInvitationListSerializer(serializers.ModelSerializer):
    invited_by_email = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    email_sent = serializers.SerializerMethodField()
    email_error = serializers.SerializerMethodField()

    class Meta:  # type: ignore[override]
        model = RecruiterInvitation
        fields = [
            "id",
            "email",
            "created_at",
            "expires_at",
            "accepted_at",
            "invited_by_email",
            "status",
            "email_sent",
            "email_error",
        ]

    def get_invited_by_email(self, obj: RecruiterInvitation) -> str | None:
        return obj.invited_by.email if obj.invited_by else None

    def get_status(self, obj: RecruiterInvitation) -> str:
        if obj.accepted_at:
            return "accepted"
        if obj.expires_at <= timezone.now():
            return "expired"
        return "pending"

    def get_email_sent(self, obj: RecruiterInvitation) -> bool:
        return getattr(obj, "email_sent", True)

    def get_email_error(self, obj: RecruiterInvitation) -> str | None:
        return getattr(obj, "email_error", None)



class AcceptInvitationSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True)
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate(self, attrs):
        raw_token = attrs.get("token", "")
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        invitation = RecruiterInvitation.objects.filter(token_hash=token_hash).first()
        if not invitation:
            raise serializers.ValidationError({"token": "Invalid invitation token."})

        if invitation.accepted_at is not None:
            raise serializers.ValidationError({"token": "This invitation has already been accepted."})

        if invitation.expires_at <= timezone.now():
            raise serializers.ValidationError({"token": "This invitation link has expired."})

        username = attrs.get("username", "").strip().replace(" ", "_")
        if _User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})

        if _User.objects.filter(email__iexact=invitation.email).exists():
            raise serializers.ValidationError({"email": "A user with this email address already exists."})

        attrs["cleaned_username"] = username
        self.invitation = invitation
        return attrs

    def save(self, **kwargs):
        username = self.validated_data["cleaned_username"]
        password = self.validated_data["password"]

        with transaction.atomic():
            recruiter_role_name = "recruiter"
            role_obj = Role.objects.filter(name=recruiter_role_name).first()

            user_manager = cast("UserManager", _User.objects)
            user = user_manager.create_user(
                email=self.invitation.email,
                username=username,
                password=password,
                role=recruiter_role_name,
                company=self.invitation.company,
                is_hr=True,
            )
            if role_obj:
                user.role_fk = role_obj
                user.save(update_fields=["role_fk"])

            self.invitation.accepted_at = timezone.now()
            self.invitation.save(update_fields=["accepted_at"])

            return user

