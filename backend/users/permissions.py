from rest_framework import permissions

class IsApplicant(permissions.BasePermission):
    """
    Allows access only to applicant users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'applicant'
        )

class IsRecruiter(permissions.BasePermission):
    """
    Allows access only to recruiter and company_admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['recruiter', 'company_admin']
        )

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Assumes the model instance has a `user` or `owner` attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request (GET, HEAD or OPTIONS).
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner.
        owner = getattr(obj, 'user', getattr(obj, 'owner', None))
        return bool(owner and owner == request.user)

class RolePermission(permissions.BasePermission):
    """
    Flexible, generic role-based permission.
    Set `allowed_roles` on the view.
    Example: allowed_roles = ['applicant', 'recruiter']
    """
    def has_permission(self, request, view):
        allowed_roles = getattr(view, 'allowed_roles', [])
        
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in allowed_roles
        )
