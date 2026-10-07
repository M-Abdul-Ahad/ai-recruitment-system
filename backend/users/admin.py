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
        "is_hr",
        "is_staff",
        "is_active",
    )
    list_filter = ("role", "is_hr", "is_staff", "is_active")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("RBAC & Company", {"fields": ("role", "role_fk", "company", "is_hr")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("RBAC & Company", {"fields": ("role", "role_fk", "company", "is_hr")}),
    )
