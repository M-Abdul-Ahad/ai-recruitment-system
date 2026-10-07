from django.contrib import admin
from .models import Company, RecruiterInvitation


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "document_type", "tax_id", "verification_status", "website", "created_at")
    list_filter = ("verification_status", "document_type", "industry")
    search_fields = ("name", "tax_id", "email")
    readonly_fields = ("created_at", "updated_at")


@admin.register(RecruiterInvitation)
class RecruiterInvitationAdmin(admin.ModelAdmin):
    list_display = ("email", "company", "invited_by", "expires_at", "accepted_at", "created_at")
    search_fields = ("email", "company__name")
