from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.urls import resolve

class RoleMiddleware(MiddlewareMixin):
    """
    Lightweight middleware to attach role info globally and 
    provide an optional fallback safety check for protected routes.
    """
    
    def process_request(self, request):
        # Attach role info if the user is authenticated (e.g., via session auth).
        # Note: DRF's JWT auth happens later in the view layer, so request.user 
        # might be AnonymousUser here for API requests. We handle DRF auth in views.
        if hasattr(request, 'user') and request.user.is_authenticated:
            request.role = getattr(request.user, 'role', None)
        else:
            request.role = None
            
        # Optional: Minimal fallback safety for globally protected paths.
        # Ensure we don't duplicate DRF logic, so we only restrict paths 
        # that definitely shouldn't be public (e.g., admin dashboard UI).
        # (Usually, DRF permissions are enough for API endpoints).
        path = request.path_info
        
        # Example of a global middleware restriction:
        # If there's a strict internal path that requires a specific role:
        # if path.startswith('/internal/admin/') and request.role != 'admin':
        #     return JsonResponse({'detail': 'Forbidden.'}, status=403)
        
        return None
