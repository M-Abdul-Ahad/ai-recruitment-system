from rest_framework import permissions
from django.contrib.auth import get_user_model


User = get_user_model()


class IsRecruiter(permissions.BasePermission):
    """
    Allows access only to users with the role "RECRUITER" or "COMPANY_ADMIN".
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in [User.Role.RECRUITER, User.Role.COMPANY_ADMIN]
        )


class IsJobOwner(permissions.BasePermission):
    """
    Allows update/delete operations only if the requesting user is the creator of the job.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request (if they pass the view's get_permissions)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the job.
        return obj.created_by == request.user


class IsApplicant(permissions.BasePermission):
    """
    Allows access only to users with the role "APPLICANT".
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.APPLICANT
        )
