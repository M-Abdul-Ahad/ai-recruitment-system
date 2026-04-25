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
        "is_staff",
        "is_active",
    )
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("RBAC", {"fields": ("role", "company")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("RBAC", {"fields": ("role", "company")}),
    )
