from django.db import models


class Company(models.Model):
    """
    Represents a company/organization that recruiters belong to.
    Kept as a separate entity for clean architecture and scalability.
    """

    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, default="")
    website = models.URLField(blank=True, default="")
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "companies"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
