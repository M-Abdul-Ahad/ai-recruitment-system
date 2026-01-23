from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Resume
from .serializers import ResumeUploadSerializer


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
        if not file.name.endswith(('.pdf', '.docx')):
            return Response(
                {"error": "Only PDF and DOCX files are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Handle user safely
        current_user = request.user if request.user.is_authenticated else None

        # 4. Save resume
        resume = Resume.objects.create(
            user=current_user,
            file=file
        )

        # 5. Serialize response
        serializer = ResumeUploadSerializer(resume)

        return Response(
            {
                "message": "Resume uploaded successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )
