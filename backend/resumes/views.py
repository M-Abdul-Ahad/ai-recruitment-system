import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Resume
from .serializers import ResumeUploadSerializer
from .utils import (
    extract_text_from_pdf,
    extract_text_from_docx,
    clean_text
)


class ResumeUploadView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        file = request.FILES.get('file')

        # 1. Check file exists
        if not file:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Validate file type
        if not file.name.lower().endswith(('.pdf', '.docx')):
            return Response(
                {"error": "Only PDF and DOCX files are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Handle user safely (auth comes later)
        current_user = request.user if request.user.is_authenticated else None

        # 4. Save resume file first
        resume = Resume.objects.create(
            user=current_user,
            file=file
        )

        # 5. Extract text based on file type
        file_path = resume.file.path
        extension = os.path.splitext(file_path)[1].lower()

        if extension == '.pdf':
            extracted_text = extract_text_from_pdf(file_path)
        else:  # .docx
            extracted_text = extract_text_from_docx(file_path)

        # 6. Clean extracted text
        cleaned_text = clean_text(extracted_text)

        # 7. Save extracted text
        resume.extracted_text = cleaned_text
        resume.save()

        # 8. Serialize response
        serializer = ResumeUploadSerializer(resume)

        return Response(
            {
                "message": "Resume uploaded and processed successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )
