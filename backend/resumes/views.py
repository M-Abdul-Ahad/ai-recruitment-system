import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Resume
from .serializers import ResumeDetailSerializer
from .utils import (
    extract_text_from_pdf,
    extract_text_from_docx,
)
from resumes.services.resume_parser import parse_and_store_resume_data


class ResumeUploadView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        file = request.FILES.get('file')

        # 1️⃣ Check file exists
        if not file:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2️⃣ Validate file type
        if not file.name.lower().endswith(('.pdf', '.docx')):
            return Response(
                {"error": "Only PDF and DOCX files are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3️⃣ Handle user safely
        current_user = request.user if request.user.is_authenticated else None

        # 4️⃣ Save resume file
        resume = Resume.objects.create(
            user=current_user,
            file=file
        )

        # 5️⃣ Extract raw text
        file_path = resume.file.path
        extension = os.path.splitext(file_path)[1].lower()

        if extension == '.pdf':
            extracted_text = extract_text_from_pdf(file_path)
        else:
            extracted_text = extract_text_from_docx(file_path)

        # 6️⃣ Save RAW extracted text (important)
        resume.extracted_text = extracted_text
        resume.save()

        # 🔥 7️⃣ Parse & store structured data (WEEK 3 CORE)
        parse_and_store_resume_data(resume)

        # 8️⃣ Return structured response
        serializer = ResumeDetailSerializer(resume)

        return Response(
            {
                "message": "Resume uploaded and parsed successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )
