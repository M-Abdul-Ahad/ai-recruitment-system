from django.contrib import admin
from .models import Job, Skill, JobApplication


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "created_by", "status", "created_at")
    list_filter = ("status", "company")
    search_fields = ("title", "description", "company__name", "created_by__email")
    filter_horizontal = ("skills",)


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("job", "applicant", "status", "resume", "match_score", "applied_at")
    list_filter = ("status",)
    search_fields = ("job__title", "applicant__email")
