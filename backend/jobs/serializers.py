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
    company_name = serializers.CharField(source='company.name', read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)

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
            'id', 'title', 'description', 'company', 'company_name',
            'created_by', 'created_by_email', 'created_by_name', 'applications_count',
            'skills', 'skills_data', 'experience_required', 'status',
            'location', 'salary_min', 'salary_max', 'created_at', 'updated_at'
        ]
        read_only_fields = ['company', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            name = f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
            return name if name else obj.created_by.username
        return ""


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


from .services.candidate_extractor import extract_candidate_email, extract_candidate_name


# --- Recruiter-facing serializers ---

class CandidateInterviewKitSerializer(serializers.ModelSerializer):
    """Serializer for AI-generated candidate interview kit."""
    class Meta:
        from .models import CandidateInterviewKit
        model = CandidateInterviewKit
        fields = ['id', 'application', 'difficulty', 'questions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'application', 'created_at', 'updated_at']


class RecruiterApplicationSerializer(serializers.ModelSerializer):
    """Serializer for recruiter viewing applications on their jobs."""
    applicant_email = serializers.SerializerMethodField()
    applicant_name = serializers.SerializerMethodField()
    resume_file = serializers.FileField(source='resume.file', read_only=True)
    resume_text = serializers.CharField(source='resume.extracted_text', read_only=True, default="")
    has_interview_kit = serializers.SerializerMethodField()
    interview_kit_id = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'applicant', 'applicant_email', 'applicant_name',
            'resume', 'resume_file', 'resume_text', 'source_type', 'status', 'tags',
            'recruiter_notes', 'match_score', 'has_interview_kit', 'interview_kit_id', 'applied_at',
        ]
        read_only_fields = ['id', 'job', 'applicant', 'applied_at']

    def get_applicant_email(self, obj):
        return extract_candidate_email(obj)

    def get_applicant_name(self, obj):
        return extract_candidate_name(obj)

    def get_has_interview_kit(self, obj):
        return hasattr(obj, 'interview_kit') and obj.interview_kit is not None

    def get_interview_kit_id(self, obj):
        if hasattr(obj, 'interview_kit') and obj.interview_kit is not None:
            return obj.interview_kit.id
        return None
