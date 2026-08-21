from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, SkillViewSet, AdminJobListCreateView, AdminJobDetailView


router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'', JobViewSet, basename='job')


urlpatterns = [
    path('admin/', AdminJobListCreateView.as_view(), name='admin-jobs'),
    path('admin/<int:pk>/', AdminJobDetailView.as_view(), name='admin-job-detail'),
    path('', include(router.urls)),
]
