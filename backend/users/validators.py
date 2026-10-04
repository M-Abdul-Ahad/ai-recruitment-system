import os
from rest_framework import serializers

MAX_CNIC_SIZE_MB = 5
MAX_DOC_SIZE_MB = 10

ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
ALLOWED_DOC_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.webp'}


def validate_cnic_file(file):
    """
    Validates uploaded CNIC / ID document:
    - Maximum size limit (5MB)
    - Allowed file extensions (images only)
    - Content-type validation
    """
    if not file:
        return file

    # 1. Size check
    if file.size > MAX_CNIC_SIZE_MB * 1024 * 1024:
        raise serializers.ValidationError(
            f"CNIC image size must not exceed {MAX_CNIC_SIZE_MB}MB."
        )

    # 2. Extension check
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_IMAGE_EXTENSIONS))
        raise serializers.ValidationError(
            f"Invalid file format for CNIC. Allowed formats: {allowed}."
        )

    # 3. Content type check if available
    content_type = getattr(file, 'content_type', '')
    if content_type and not content_type.startswith('image/'):
        raise serializers.ValidationError(
            "Uploaded CNIC file must be a valid image."
        )

    return file


def validate_company_document(file):
    """
    Validates uploaded Company Registration / Tax document:
    - Maximum size limit (10MB)
    - Allowed file extensions (PDF, PNG, JPG, JPEG, WEBP)
    - Content-type validation
    """
    if not file:
        return file

    # 1. Size check
    if file.size > MAX_DOC_SIZE_MB * 1024 * 1024:
        raise serializers.ValidationError(
            f"Company document size must not exceed {MAX_DOC_SIZE_MB}MB."
        )

    # 2. Extension check
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_DOC_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_DOC_EXTENSIONS))
        raise serializers.ValidationError(
            f"Invalid file format for company document. Allowed formats: {allowed}."
        )

    # 3. Content type check if available
    content_type = getattr(file, 'content_type', '')
    if content_type:
        is_pdf = content_type == 'application/pdf'
        is_img = content_type.startswith('image/')
        if not (is_pdf or is_img):
            raise serializers.ValidationError(
                "Uploaded company document must be a PDF or image."
            )

    return file
