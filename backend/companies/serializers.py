from __future__ import annotations

from typing import TYPE_CHECKING, cast

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Company

if TYPE_CHECKING:
    from users.models import User

_User = get_user_model()


class CompanyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = _User
        fields = ["id", "username", "role", "is_hr"]


class CompanySerializer(serializers.ModelSerializer):
    """Read-only serializer for Company details."""
    recruiters = CompanyMemberSerializer(many=True, read_only=True)

    class Meta:
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

    class Meta:
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
