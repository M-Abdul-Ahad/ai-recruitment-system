from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Job(models.Model):
    class JobStatus(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE = "ACTIVE", "Active"
        CLOSED = "CLOSED", "Closed"
        
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        related_name="jobs",
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="posted_jobs",
    )
    
    skills = models.ManyToManyField(
        Skill,
        related_name="jobs",
    )
    
    experience_required = models.IntegerField(help_text="Experience required in years")
    
    status = models.CharField(
        max_length=20,
        choices=JobStatus.choices,
        default=JobStatus.DRAFT,
    )
    
    location = models.CharField(max_length=255, blank=True)
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} at {self.company.name}"


class JobApplication(models.Model):
    class ApplicationStatus(models.TextChoices):
        APPLIED = "APPLIED", "Applied"
        SHORTLISTED = "SHORTLISTED", "Shortlisted"
        INTERVIEW = "INTERVIEW", "Interview"
        REJECTED = "REJECTED", "Rejected"

    class SourceType(models.TextChoices):
        APPLICATION = "APPLICATION", "Application"
        RECRUITER_UPLOAD = "RECRUITER_UPLOAD", "Recruiter Upload"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="job_applications",
    )
    resume = models.ForeignKey(
        "resumes.Resume",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="applications",
    )
    source_type = models.CharField(
        max_length=20,
        choices=SourceType.choices,
        default=SourceType.APPLICATION,
    )
    status = models.CharField(
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.APPLIED,
    )
    tags = models.JSONField(default=list, blank=True, help_text="Candidate tags for filtering")
    recruiter_notes = models.TextField(blank=True, default="")
    match_score = models.FloatField(null=True, blank=True, help_text="AI-generated match score")
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['job', 'applicant']
        constraints = [
            models.UniqueConstraint(
                fields=['job', 'resume'],
                condition=models.Q(resume__isnull=False),
                name='unique_job_resume',
            ),
        ]

    def __str__(self):
        applicant_identifier = self.applicant.email if self.applicant else f"Recruiter Candidate (Resume #{self.resume_id})"
        return f"{applicant_identifier} for {self.job.title}"

