import os
import re
import time
import mimetypes
import logging
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from django.conf import settings

logger = logging.getLogger(__name__)


def get_r2_client():
    """
    Initializes and returns a boto3 S3-compatible client for Cloudflare R2.
    Supports both settings.R2_* and environment variables (DEFAULT_URL, ACCESS_KEY_ID, SECRET_ACCESS_KEY).
    """
    endpoint_url = (
        getattr(settings, "R2_ENDPOINT_URL", "")
        or os.getenv("DEFAULT_URL")
        or getattr(settings, "DEFAULT_URL", "")
    )
    access_key = (
        getattr(settings, "R2_ACCESS_KEY_ID", "")
        or os.getenv("ACCESS_KEY_ID")
        or getattr(settings, "ACCESS_KEY_ID", "")
    )
    secret_key = (
        getattr(settings, "R2_SECRET_ACCESS_KEY", "")
        or os.getenv("SECRET_ACCESS_KEY")
        or getattr(settings, "SECRET_ACCESS_KEY", "")
    )

    if not endpoint_url or not access_key or not secret_key:
        logger.error("[R2 Storage] Missing Cloudflare R2 credentials.")
        raise ValueError(
            "Cloudflare R2 credentials (DEFAULT_URL / R2_ENDPOINT_URL, ACCESS_KEY_ID, SECRET_ACCESS_KEY) must be set."
        )

    return boto3.client(
        service_name="s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def get_bucket_name() -> str:
    """Returns the configured R2 bucket name."""
    return (
        getattr(settings, "R2_BUCKET_NAME", "")
        or os.getenv("BUCKET_NAME")
        or getattr(settings, "BUCKET_NAME", "resumes-storage")
    )


# ---------------------------------------------------------------------------
# Company Document & CNIC Uploads (Used in users/serializers & companies/serializers)
# ---------------------------------------------------------------------------

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
    Supports returning direct HTTP/HTTPS URLs as-is.
    """
    if not doc_key:
        return None

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


# ---------------------------------------------------------------------------
# Candidate Resume Storage (Used in jobs/views for Candidate Shortlisting)
# ---------------------------------------------------------------------------

def upload_file_to_r2(local_file_path: str, object_key: str, content_type: str = None) -> str:
    """
    Uploads a file from local filesystem to Cloudflare R2 bucket.
    Only called for permanently shortlisted resumes.
    Returns the object_key.
    """
    client = get_r2_client()
    bucket = get_bucket_name()

    if not content_type:
        content_type, _ = mimetypes.guess_type(local_file_path)
    content_type = content_type or "application/octet-stream"

    extra_args = {"ContentType": content_type}

    with open(local_file_path, "rb") as f:
        client.upload_fileobj(
            Fileobj=f,
            Bucket=bucket,
            Key=object_key,
            ExtraArgs=extra_args
        )

    logger.info(f"Successfully uploaded {local_file_path} to Cloudflare R2 as {object_key}")
    return object_key


def generate_r2_presigned_url(object_key: str, expiration: int = 3600) -> str:
    """
    Generates a secure presigned URL to view or download a file stored in R2.
    Default expiration is 1 hour (3600s).
    """
    client = get_r2_client()
    bucket = get_bucket_name()

    try:
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": object_key},
            ExpiresIn=expiration
        )
        return url
    except ClientError as e:
        logger.error(f"Failed to generate presigned URL for {object_key}: {e}")
        return ""


def delete_file_from_r2(object_key: str) -> bool:
    """
    Deletes an object from Cloudflare R2 bucket.
    """
    try:
        client = get_r2_client()
        bucket = get_bucket_name()
        client.delete_object(Bucket=bucket, Key=object_key)
        return True
    except Exception as e:
        logger.error(f"Failed to delete {object_key} from R2: {e}")
        return False
