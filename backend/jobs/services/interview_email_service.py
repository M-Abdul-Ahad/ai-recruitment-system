"""
jobs/services/interview_email_service.py
----------------------------------------
Sends candidate shortlisting notification emails via Python's built-in smtplib.
Emails are extracted directly from candidate resumes or applicant profiles.
Uses existing SMTP configuration from backend/.env.
"""
from __future__ import annotations

import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from django.conf import settings
from .candidate_extractor import extract_candidate_email, extract_candidate_name

logger = logging.getLogger("jobs.interview_email_service")


def _get_smtp_config() -> dict:
    """Pull SMTP config from Django settings."""
    return {
        "host": getattr(settings, "EMAIL_HOST", "smtp.gmail.com"),
        "port": int(getattr(settings, "EMAIL_PORT", 587)),
        "use_tls": getattr(settings, "EMAIL_USE_TLS", True),
        "use_ssl": getattr(settings, "EMAIL_USE_SSL", False),
        "user": getattr(settings, "EMAIL_HOST_USER", ""),
        "password": getattr(settings, "EMAIL_HOST_PASSWORD", ""),
        "from_email": getattr(settings, "DEFAULT_FROM_EMAIL", ""),
    }


def send_candidate_shortlist_email(
    application,
    job,
    custom_message: Optional[str] = None
) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Sends a shortlist notification email to the candidate.
    
    Returns:
        (success: bool, error_message: Optional[str], candidate_email: Optional[str])
    """
    to_email = extract_candidate_email(application)
    if not to_email:
        err = f"No email found in resume or profile for candidate #{application.id}"
        logger.warning(err)
        return False, err, None

    candidate_name = extract_candidate_name(application)
    company_name = job.company.name if job.company else "Our Company"
    job_title = job.title

    cfg = _get_smtp_config()

    if not cfg["user"] or not cfg["password"]:
        err = "EMAIL_HOST_USER or EMAIL_HOST_PASSWORD is not configured in .env."
        logger.error(err)
        return False, err, to_email

    from_email = cfg["from_email"] or cfg["user"]
    display_from = f"{company_name} Hiring Team <{from_email}>"

    subject = f"Congratulations {candidate_name}! You've been shortlisted for {job_title} at {company_name}"

    additional_note_html = ""
    additional_note_plain = ""
    if custom_message and custom_message.strip():
        additional_note_plain = f"\n\nA note from our hiring team:\n{custom_message.strip()}\n"
        additional_note_html = (
            "<div style='margin: 20px 0; padding: 16px; background-color: #f0fdf4; "
            "border-left: 4px solid #16a34a; border-radius: 4px;'>"
            "<p style='margin: 0; font-size: 14px; color: #166534; font-weight: bold;'>Note from Hiring Team:</p>"
            f"<p style='margin: 6px 0 0 0; font-size: 14px; color: #15803d;'>{custom_message.strip()}</p>"
            "</div>"
        )

    plain_body = (
        f"Dear {candidate_name},\n\n"
        f"Congratulations! We are delighted to inform you that you have been shortlisted for the "
        f"{job_title} position at {company_name}.\n\n"
        f"Our hiring team reviewed your resume and profile and was impressed by your skills and background. "
        f"We would like to invite you to the interview stage of our selection process.\n"
        f"{additional_note_plain}\n"
        f"Our team will be in touch with you shortly with the exact schedule, interview link, and further details.\n\n"
        f"If you have any questions in the meantime, please feel free to reply to this email.\n\n"
        f"Best regards,\n"
        f"{company_name} Recruitment Team"
    )

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shortlisted for {job_title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 28px; text-align: center;">
      <span style="display: inline-block; padding: 4px 12px; background: rgba(255, 255, 255, 0.2); border-radius: 9999px; font-size: 12px; font-weight: 600; color: #ffffff; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px;">
        Application Update
      </span>
      <h1 style="color: #ffffff; margin: 8px 0 0 0; font-size: 24px; font-weight: 700; line-height: 1.3;">
        You're Shortlisted!
      </h1>
      <p style="color: #bfdbfe; margin: 6px 0 0 0; font-size: 15px;">
        {job_title} &bull; {company_name}
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 28px;">
      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">
        Dear <strong>{candidate_name}</strong>,
      </p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        Congratulations! We are delighted to inform you that after reviewing your resume and profile, you have been 
        <strong>shortlisted</strong> for the position of <strong>{job_title}</strong> at <strong>{company_name}</strong>.
      </p>

      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em;">Next Steps</h4>
        <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">
          Our recruitment team will be contacting you shortly with your interview schedule, meeting link, and preparation notes.
        </p>
      </div>

      {additional_note_html}

      <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-top: 28px;">
        Best regards,<br>
        <strong style="color: #0f172a;">{company_name} Talent Acquisition Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
        This email was sent to {to_email} regarding your application for {job_title}.
      </p>
    </div>

  </div>
</body>
</html>"""

    mime_msg = MIMEMultipart("alternative")
    mime_msg["Subject"] = subject
    mime_msg["From"] = display_from
    mime_msg["To"] = to_email
    mime_msg.attach(MIMEText(plain_body, "plain"))
    mime_msg.attach(MIMEText(html_body, "html"))

    try:
        if cfg["use_ssl"]:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(cfg["host"], cfg["port"], context=context) as server:
                server.login(cfg["user"], cfg["password"])
                server.sendmail(from_email, [to_email], mime_msg.as_string())
        else:
            with smtplib.SMTP(cfg["host"], cfg["port"]) as server:
                server.ehlo()
                if cfg["use_tls"]:
                    server.starttls(context=ssl.create_default_context())
                    server.ehlo()
                server.login(cfg["user"], cfg["password"])
                server.sendmail(from_email, [to_email], mime_msg.as_string())

        logger.info("Successfully sent shortlist email to %s for Job %s", to_email, job.id)
        return True, None, to_email

    except Exception as exc:
        err = f"Failed to send email to {to_email}: {exc}"
        logger.error(err)
        return False, err, to_email
