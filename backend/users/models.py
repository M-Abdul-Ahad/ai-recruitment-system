from django.db import models
from django.contrib.auth.models import AbstractUser


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = "roles"

    def __str__(self):
        return self.name


class User(AbstractUser):

    class Role(models.TextChoices):
        APPLICANT = "applicant", "Applicant"
        RECRUITER = "recruiter", "Recruiter"
        COMPANY_ADMIN = "company_admin", "Company Admin"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.APPLICANT,
        blank=False,
        null=False,
    )

    role_fk = models.ForeignKey(
        "Role",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="role_id",
        related_name="users",
    )

    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recruiters",
    )

    is_hr = models.BooleanField(default=False)

    class VerificationStatus(models.TextChoices):
        UNVERIFIED = "unverified", "Unverified"
        PENDING = "pending", "Pending Verification"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    cnic_number = models.CharField(
        max_length=25,
        blank=True,
        default="",
        help_text="National Identity Card (CNIC / ID) Number",
    )
    cnic_image = models.ImageField(
        upload_to="verification/cnic/",
        blank=True,
        null=True,
        help_text="Uploaded CNIC / Identity Document photo",
    )
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.UNVERIFIED,
        help_text="Identity document verification status",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


class UserRole(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="user_roles",
    )
    role = models.ForeignKey(
        "Role",
        on_delete=models.CASCADE,
        db_column="role_id",
        related_name="role_users",
    )

    class Meta:
        db_table = "user_roles"
        unique_together = [("user", "role")]

    def __str__(self):
        return f"{self.user.email} - {self.role.name}"