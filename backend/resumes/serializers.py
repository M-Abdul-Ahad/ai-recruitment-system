from rest_framework import serializers
from .models import Resume, ResumeSkill, Education, Experience

class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class ResumeSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeSkill
        fields = ["id", "name"]

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["id", "degree", "institution", "year"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            "id",
            "job_title",
            "company",
            "duration",
            "description"
        ]


class ResumeDetailSerializer(serializers.ModelSerializer):
    skills = ResumeSkillSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = [
            "id",
            "file",
            "uploaded_at",
            "skills",
            "education",
            "experience"
        ]


