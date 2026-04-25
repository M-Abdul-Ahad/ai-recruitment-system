from rest_framework import permissions

class IsHR(permissions.BasePermission):
    """
    Allows access only to HR users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'is_hr', False))
