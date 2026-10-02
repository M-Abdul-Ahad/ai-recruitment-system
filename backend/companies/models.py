from django.db import models
from django.conf import settings


class Company(models.Model):
    """
    Represents a company/organization that recruiters belong to.
    Kept as a separate entity for clean architecture and scalability.
    """

    name = models.CharField(max_length=255, unique=True)
    email = models.EmailField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    website = models.URLField(blank=True, default="")
    industry = models.CharField(max_length=100, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    address = models.TextField(blank=True, default="")
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)

    class VerificationStatus(models.TextChoices):
        UNVERIFIED = "unverified", "Unverified"
        PENDING = "pending", "Pending Verification"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    tax_id = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="National Tax Number (NTN), EIN, or Business Registration ID",
    )
    registration_document = models.FileField(
        upload_to="verification/company_docs/",
        blank=True,
        null=True,
        help_text="Uploaded official business registration / incorporation certificate",
    )
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.UNVERIFIED,
        help_text="Company business verification status",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "companies"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class RecruiterInvitation(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        db_column="company_id",
        related_name="invitations",
    )
    email = models.EmailField(max_length=255)
    token_hash = models.CharField(max_length=255)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="invited_by_id",
        related_name="sent_invitations",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "recruiter_invitations"

    def __str__(self):
        return f"Invitation for {self.email} to {self.company.name}"

