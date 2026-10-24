import re
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Standard robust email regex pattern
EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')


def extract_email_from_text(text: Optional[str]) -> Optional[str]:
    """
    Extracts the first valid candidate email address found in the given resume text.
    Filters out common system or image placeholders.
    """
    if not text:
        return None

    matches = EMAIL_REGEX.findall(text)
    if not matches:
        return None

    for email in matches:
        email_clean = email.strip().strip(".,;:()<>[]{}'\"")
        # Exclude typical placeholder or generic emails if any
        lower = email_clean.lower()
        if any(ign in lower for ign in ["example.com", "placeholder", "noreply", "sentry.io"]):
            continue
        return email_clean

    return matches[0].strip(".,;:()<>[]{}'\"")


def extract_candidate_email(application) -> Optional[str]:
    """
    Finds the candidate's email address for a given JobApplication.
    Checks:
    1. application.applicant.email (if applicant user account exists)
    2. application.resume.extracted_text
    3. application.resume.cleaned_text
    """
    if application.applicant and getattr(application.applicant, "email", None):
        return application.applicant.email.strip()

    resume = getattr(application, "resume", None)
    if resume:
        # Check extracted_text first
        email = extract_email_from_text(resume.extracted_text)
        if email:
            return email
        # Check cleaned_text fallback
        email = extract_email_from_text(resume.cleaned_text)
        if email:
            return email

    return None


def extract_candidate_name(application) -> str:
    """
    Extracts a clean human name for the candidate from:
    1. application.applicant full name / username
    2. Candidate name at top of resume text
    3. Cleaned resume filename
    4. Fallback to Candidate #ID
    """
    # 1. Check registered applicant account
    if application.applicant:
        full_name = application.applicant.get_full_name().strip() if hasattr(application.applicant, "get_full_name") else ""
        if full_name:
            return full_name
        if application.applicant.username:
            return application.applicant.username.strip()

    resume = getattr(application, "resume", None)
    if resume:
        # 2. Try to detect name from first 5 non-empty lines of extracted text
        text = resume.extracted_text or resume.cleaned_text or ""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        header_blacklist = {
            "projects", "experience", "education", "skills", "summary", "profile",
            "curriculum", "vitae", "resume", "objective", "contact", "work", "technical"
        }
        for line in lines[:5]:
            # Clean off any trailing file extensions if line got corrupted
            cleaned = re.sub(r'\.(pdf|docx|txt)$', '', line, flags=re.IGNORECASE).strip()
            words = cleaned.split()
            if 1 <= len(words) <= 4:
                alpha_line = re.sub(r'[^a-zA-Z\s]', '', cleaned).strip()
                lower_line = alpha_line.lower()
                if (
                    alpha_line
                    and len(alpha_line) > 2
                    and "@" not in line
                    and "http" not in line
                    and not any(blk in lower_line.split() for blk in header_blacklist)
                ):
                    return " ".join(w.capitalize() for w in alpha_line.split())

        # 3. Derive from file name
        if resume.file:
            base_name = os.path.basename(str(resume.file.name))
            # Remove hash / uuid prefix if present (e.g. uuid_filename.pdf)
            if "_" in base_name:
                parts = base_name.split("_")
                if len(parts[0]) >= 8 and any(c.isdigit() for c in parts[0]):
                    base_name = "_".join(parts[1:])
            # Strip file extension
            clean_name = re.sub(r'\.(pdf|docx|txt)$', '', base_name, flags=re.IGNORECASE)
            # Remove words like "resume", "cv", "applied"
            clean_name = re.sub(r'[-_](resume|cv|latest|updated|final)[-_]?', ' ', clean_name, flags=re.IGNORECASE)
            clean_name = clean_name.replace("_", " ").replace("-", " ").strip()
            if clean_name and not clean_name.isdigit():
                return " ".join(w.capitalize() for w in clean_name.split())

    return f"Candidate #{application.id}"
