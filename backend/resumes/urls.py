from django.urls import path
from resumes.views import ResumeUploadView, generate_ai_feedback

urlpatterns = [
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),

    path('ai-feedback/<int:resume_id>/', generate_ai_feedback, name='resume-ai-feedback'),
]
