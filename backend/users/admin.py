from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin


User = get_user_model()


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = (
        "email",
        "username",
        "role",
        "company",
        "cnic_number",
        "verification_status",
        "is_staff",
        "is_active",
    )
    list_filter = ("role", "verification_status", "is_staff", "is_active")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("RBAC & Company", {"fields": ("role", "company")}),
        ("Identity Verification", {"fields": ("cnic_number", "cnic_image", "verification_status")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("RBAC & Company", {"fields": ("role", "company")}),
        ("Identity Verification", {"fields": ("cnic_number", "cnic_image", "verification_status")}),
    )
