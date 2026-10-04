from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "tax_id", "verification_status", "website", "created_at")
    list_filter = ("verification_status", "industry")
    search_fields = ("name", "tax_id", "email")
    readonly_fields = ("created_at", "updated_at")
