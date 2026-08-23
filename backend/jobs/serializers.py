from rest_framework import serializers
from .models import Job, Skill, JobApplication
from resumes.models import Resume


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


# --- Applicant-facing serializers ---

class JobListSerializer(serializers.ModelSerializer):
    """Compact serializer for job listing (applicant browse view)."""
    company_name = serializers.CharField(source='company.name', read_only=True)
    skills_data = SkillSerializer(source='skills', many=True, read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company_name', 'location',
            'experience_required', 'salary_min', 'salary_max',
            'skills_data', 'created_at',
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for a single job (applicant detail view)."""
    company_name = serializers.CharField(source='company.name', read_only=True)
    skills_data = SkillSerializer(source='skills', many=True, read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'company_name', 'location',
            'experience_required', 'salary_min', 'salary_max',
            'skills_data', 'status', 'created_at', 'updated_at',
        ]


class JobApplicationSerializer(serializers.ModelSerializer):
    """Serializer for applicant applying to a job."""
    resume_id = serializers.PrimaryKeyRelatedField(
        queryset=Resume.objects.all(),
        source='resume',
        required=False,
        allow_null=True,
    )
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'company_name',
            'resume_id', 'source_type', 'status', 'tags', 'applied_at',
        ]
        read_only_fields = ['id', 'job', 'source_type', 'status', 'applied_at']

    def validate_resume_id(self, resume):
        """Ensure the resume belongs to the requesting applicant."""
        if resume is None:
            return resume
        request = self.context.get('request')
        if request and resume.user != request.user:
            raise serializers.ValidationError("You can only use your own resumes.")
        return resume


# --- Recruiter-facing serializers ---

class RecruiterApplicationSerializer(serializers.ModelSerializer):
    """Serializer for recruiter viewing applications on their jobs."""
    applicant_email = serializers.SerializerMethodField()
    applicant_name = serializers.SerializerMethodField()
    resume_file = serializers.FileField(source='resume.file', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'applicant', 'applicant_email', 'applicant_name',
            'resume', 'resume_file', 'source_type', 'status', 'tags',
            'recruiter_notes', 'match_score', 'applied_at',
        ]
        read_only_fields = ['id', 'job', 'applicant', 'applied_at']

    def get_applicant_email(self, obj):
        return obj.applicant.email if obj.applicant else None

    def get_applicant_name(self, obj):
        return obj.applicant.username if obj.applicant else "Recruiter Candidate"

