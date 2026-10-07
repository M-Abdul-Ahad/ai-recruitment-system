import os
import re
import time
import mimetypes
import logging
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from django.conf import settings

logger = logging.getLogger("core.r2_storage")


def get_r2_client():
    """
    Initializes and returns a boto3 S3 client configured for Cloudflare R2.
    Reads credentials directly from environment/Django settings.
    """
    endpoint_url = os.getenv("DEFAULT_URL") or getattr(settings, "DEFAULT_URL", "")
    access_key = os.getenv("ACCESS_KEY_ID") or getattr(settings, "ACCESS_KEY_ID", "")
    secret_key = os.getenv("SECRET_ACCESS_KEY") or getattr(settings, "SECRET_ACCESS_KEY", "")

    if not endpoint_url or not access_key or not secret_key:
        logger.error("[R2 Storage] Missing Cloudflare R2 credentials in environment variables.")
        raise ValueError("Cloudflare R2 credentials (DEFAULT_URL, ACCESS_KEY_ID, SECRET_ACCESS_KEY) must be set.")

    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def get_bucket_name() -> str:
    return os.getenv("BUCKET_NAME") or getattr(settings, "BUCKET_NAME", "resumes-storage")


def upload_company_document(file_obj, filename: str, company_name: str = "") -> str:
    """
    Uploads a company verification document (SECP / NTN) to Cloudflare R2 under company-docs/.

    Args:
        file_obj: File-like object or InMemoryUploadedFile / TemporaryUploadedFile
        filename: Original uploaded file name
        company_name: Name of the company for clear identifier

    Returns:
        The R2 object key (e.g. 'company-docs/1728320491_acme_corp_secp_cert.pdf')
    """
    client = get_r2_client()
    bucket = get_bucket_name()

    # Clean company name and filename for safe S3 keys
    slug_company = re.sub(r'[^a-zA-Z0-9_-]', '_', company_name.strip().lower()) if company_name else "company"
    slug_company = re.sub(r'_+', '_', slug_company).strip('_')[:30]

    base_name, ext = os.path.splitext(filename)
    slug_file = re.sub(r'[^a-zA-Z0-9_-]', '_', base_name.strip().lower())
    slug_file = re.sub(r'_+', '_', slug_file).strip('_')[:30]
    ext = ext.lower()

    timestamp = int(time.time())
    key = f"company-docs/{timestamp}_{slug_company}_{slug_file}{ext}"

    content_type, _ = mimetypes.guess_type(filename)
    if not content_type:
        content_type = getattr(file_obj, "content_type", "application/octet-stream")

    # Rewind file pointer if necessary
    if hasattr(file_obj, "seek"):
        file_obj.seek(0)

    logger.info("[R2 Storage] Uploading company document to bucket %s key %s (type: %s)", bucket, key, content_type)

    extra_args = {"ContentType": content_type}
    client.upload_fileobj(file_obj, bucket, key, ExtraArgs=extra_args)

    logger.info("[R2 Storage] Successfully uploaded %s to R2.", key)
    return key


def upload_user_cnic(file_obj, filename: str, username: str = "") -> str:
    """
    Uploads a user's CNIC / ID photo to Cloudflare R2 under users-cnic/.

    Args:
        file_obj: File-like object (InMemoryUploadedFile / TemporaryUploadedFile)
        filename: Original uploaded file name
        username: Username or email of the applicant

    Returns:
        The R2 object key (e.g. 'users-cnic/1728320491_john_doe_cnic_front.jpg')
    """
    client = get_r2_client()
    bucket = get_bucket_name()

    slug_user = re.sub(r'[^a-zA-Z0-9_-]', '_', username.strip().lower()) if username else "user"
    slug_user = re.sub(r'_+', '_', slug_user).strip('_')[:30]

    base_name, ext = os.path.splitext(filename)
    slug_file = re.sub(r'[^a-zA-Z0-9_-]', '_', base_name.strip().lower())
    slug_file = re.sub(r'_+', '_', slug_file).strip('_')[:30]
    ext = ext.lower()

    timestamp = int(time.time())
    key = f"users-cnic/{timestamp}_{slug_user}_{slug_file}{ext}"

    content_type, _ = mimetypes.guess_type(filename)
    if not content_type:
        content_type = getattr(file_obj, "content_type", "image/jpeg")

    if hasattr(file_obj, "seek"):
        file_obj.seek(0)

    logger.info("[R2 Storage] Uploading user CNIC image to bucket %s key %s (type: %s)", bucket, key, content_type)

    extra_args = {"ContentType": content_type}
    client.upload_fileobj(file_obj, bucket, key, ExtraArgs=extra_args)

    logger.info("[R2 Storage] Successfully uploaded %s to R2.", key)
    return key


def generate_presigned_view_url(doc_key: str, expires_in: int = 3600) -> str | None:
    """
    Generates a secure temporary presigned URL for viewing/downloading the document from R2.

    Args:
        doc_key: The storage key inside R2 (e.g. 'company-docs/...')
        expires_in: Expiration time in seconds (default 1 hour)

    Returns:
        Presigned URL string or None if generation failed.
    """
    if not doc_key:
        return None

    # If it's already a full HTTP/HTTPS URL, return as is
    if doc_key.startswith("http://") or doc_key.startswith("https://"):
        return doc_key

    try:
        client = get_r2_client()
        bucket = get_bucket_name()
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": doc_key},
            ExpiresIn=expires_in,
        )
        return url
    except Exception as exc:
        logger.error("[R2 Storage] Failed to generate presigned URL for key %s: %s", doc_key, exc)
        return None
