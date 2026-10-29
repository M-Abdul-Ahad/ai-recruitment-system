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
    Allows update/delete/manage operations if the requesting user is the creator of the job,
    or a company admin for that company, or a platform administrator.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request (if they pass the view's get_permissions)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are allowed to the creator of the job
        if obj.created_by == request.user:
            return True

        # Write permissions are also allowed to company admin of that job's company
        if (
            request.user.role == User.Role.COMPANY_ADMIN
            and request.user.company is not None
            and obj.company == request.user.company
        ):
            return True

        # Allow platform admin or superuser
        if request.user.role == User.Role.ADMIN or request.user.is_superuser:
            return True

        return False


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
