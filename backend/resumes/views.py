import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.generics import ListAPIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Resume
from .serializers import ResumeUploadSerializer
from .utils import extract_text_from_pdf, extract_text_from_docx, clean_text


class ResumeListView(ListAPIView):
    queryset = Resume.objects.all().order_by("-uploaded_at")
    serializer_class = ResumeUploadSerializer


class ResumeUploadView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file = request.FILES.get("file")

        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.lower().endswith((".pdf", ".docx")):
            return Response({"error": "Only PDF and DOCX files are allowed"}, status=status.HTTP_400_BAD_REQUEST)

        current_user = request.user if request.user.is_authenticated else None

        resume = Resume.objects.create(user=current_user, file=file)

        file_path = resume.file.path
        ext = os.path.splitext(file_path)[1].lower()

        extracted_text = extract_text_from_pdf(file_path) if ext == ".pdf" else extract_text_from_docx(file_path)
        resume.extracted_text = clean_text(extracted_text)
        resume.save()

        serializer = ResumeUploadSerializer(resume)

        return Response(
            {"message": "Resume uploaded and processed successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )
