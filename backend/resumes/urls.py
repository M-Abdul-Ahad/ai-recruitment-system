from django.urls import path
from resumes.views import ResumeUploadView

urlpatterns = [
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),
]
