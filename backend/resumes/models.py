from django.db import models
from django.conf import settings

class Resume(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,  # changed
        null=True,
        blank=True
    )
    file = models.FileField(upload_to='resumes/')
    extracted_text = models.TextField(null=True, blank=True)  # added
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} - Resume"
