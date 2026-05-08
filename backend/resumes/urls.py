from django.urls import path
from resumes.views import ResumeUploadView, generate_ai_feedback, my_resumes

urlpatterns = [
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('my-resumes/', my_resumes, name='my-resumes'),
    path('ai-feedback/<int:resume_id>/', generate_ai_feedback, name='resume-ai-feedback'),
]
