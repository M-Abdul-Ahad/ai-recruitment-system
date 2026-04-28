from rest_framework import serializers
from .models import Job, Skill, JobApplication


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class JobSerializer(serializers.ModelSerializer):
    # Return nested skill data for read operations
    skills_data = SkillSerializer(source='skills', many=True, read_only=True)
    
    # Accept list of skill IDs for write operations
    skills = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'company', 'created_by',
            'skills', 'skills_data', 'experience_required', 'status',
            'location', 'salary_min', 'salary_max', 'created_at', 'updated_at'
        ]
        read_only_fields = ['company', 'created_by', 'created_at', 'updated_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'applicant', 'status', 'applied_at']
        read_only_fields = ['job', 'applicant', 'status', 'applied_at']
