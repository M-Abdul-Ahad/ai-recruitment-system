from rest_framework import serializers
from .models import Resume

class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'file', 'uploaded_at']
