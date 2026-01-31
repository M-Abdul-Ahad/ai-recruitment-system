from django.urls import path
from .views import ResumeUploadView, ResumeListView

urlpatterns = [
    path("", ResumeListView.as_view(), name="resume-list"),
    path("upload/", ResumeUploadView.as_view(), name="resume-upload"),
]
