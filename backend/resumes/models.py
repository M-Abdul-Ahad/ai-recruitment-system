from django.db import models
from django.conf import settings


class Resume(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    file = models.FileField(upload_to='resumes/')
    file_hash = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True,
        help_text="SHA-256 hex digest of the uploaded file, used for duplicate detection.",
    )
    extracted_text = models.TextField(null=True, blank=True)
    cleaned_text = models.TextField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # 🔥 AI Fields
    ai_score = models.IntegerField(null=True, blank=True)
    ai_feedback = models.TextField(null=True, blank=True)
    ai_strengths = models.JSONField(null=True, blank=True)
    ai_weaknesses = models.JSONField(null=True, blank=True)
    ai_suggestions = models.JSONField(null=True, blank=True)
    ai_category_scores = models.JSONField(null=True, blank=True)
    ai_recommended_certifications = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} - Resume"


class ResumeSkill(models.Model):
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Education(models.Model):
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='education'
    )
    degree = models.CharField(max_length=200)
    institution = models.CharField(max_length=200)
    year = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f"{self.degree} - {self.institution}"

class Experience(models.Model):
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='experience'
    )
    job_title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    duration = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.job_title} - {self.company}"
