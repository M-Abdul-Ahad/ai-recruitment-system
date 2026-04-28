from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, SkillViewSet


router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'', JobViewSet, basename='job')


urlpatterns = [
    path('', include(router.urls)),
]
