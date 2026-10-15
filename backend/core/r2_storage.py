import os
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
    """
    endpoint_url = getattr(settings, "R2_ENDPOINT_URL", "") or ""
    access_key = getattr(settings, "R2_ACCESS_KEY_ID", "") or ""
    secret_key = getattr(settings, "R2_SECRET_ACCESS_KEY", "") or ""

    if not endpoint_url or not access_key or not secret_key:
        raise ValueError(
            "Cloudflare R2 credentials (DEFAULT_URL, ACCESS_KEY_ID, SECRET_ACCESS_KEY) are not fully configured."
        )

    return boto3.client(
        service_name="s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
        config=Config(signature_version="s3v4")
    )


def upload_file_to_r2(local_file_path: str, object_key: str, content_type: str = None) -> str:
    """
    Uploads a file from local filesystem to Cloudflare R2 bucket.
    Only called for permanently shortlisted resumes.
    Returns the object_key.
    """
    client = get_r2_client()
    bucket = getattr(settings, "R2_BUCKET_NAME", "resumes-storage")

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
    bucket = getattr(settings, "R2_BUCKET_NAME", "resumes-storage")

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
        bucket = getattr(settings, "R2_BUCKET_NAME", "resumes-storage")
        client.delete_object(Bucket=bucket, Key=object_key)
        return True
    except Exception as e:
        logger.error(f"Failed to delete {object_key} from R2: {e}")
        return False
