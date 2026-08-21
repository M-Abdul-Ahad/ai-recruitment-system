from django.urls import path
from .views import (
    SignupView, TestAuthView, CustomTokenObtainPairView,
    AdminUserListCreateView, AdminUserDetailView,
    RoleListCreateView, RoleDetailView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('test/', TestAuthView.as_view(), name='test-auth'),

    # Admin — User Management
    path('admin/users/', AdminUserListCreateView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),

    # Admin — Role Management
    path('admin/roles/', RoleListCreateView.as_view(), name='admin-roles'),
    path('admin/roles/<int:pk>/', RoleDetailView.as_view(), name='admin-role-detail'),
]