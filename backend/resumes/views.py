from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Resume
from .serializers import ResumeUploadSerializer

# Create your views here.
class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')

        if not file:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # File type validation
        if not file.name.endswith(('.pdf', '.docx')):
            return Response(
                {"error": "Only PDF and DOCX files are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        resume = Resume.objects.create(
            user=request.user,
            file=file
        )

        serializer = ResumeUploadSerializer(resume)

        return Response(
            {
                "message": "Resume uploaded successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )
