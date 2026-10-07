"""
companies/email_utils.py
------------------------
Sends recruiter invitations and company registration verification emails
via Python's built-in smtplib with comprehensive error handling and logging.
"""
from __future__ import annotations

import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from django.conf import settings

logger = logging.getLogger("companies.email_utils")


def _get_smtp_config() -> dict:
    """Pull SMTP config from Django settings (loaded from .env)."""
    return {
        "host": getattr(settings, "EMAIL_HOST", "smtp.gmail.com"),
        "port": int(getattr(settings, "EMAIL_PORT", 587)),
        "use_tls": getattr(settings, "EMAIL_USE_TLS", True),
        "use_ssl": getattr(settings, "EMAIL_USE_SSL", False),
        "user": getattr(settings, "EMAIL_HOST_USER", ""),
        "password": getattr(settings, "EMAIL_HOST_PASSWORD", ""),
        "from_email": getattr(settings, "DEFAULT_FROM_EMAIL", ""),
    }


def _send_smtp_email(to_email: str, subject: str, plain_body: str, html_body: str) -> tuple[bool, str | None]:
    """Helper to dispatch MIME emails via configured SMTP server."""
    cfg = _get_smtp_config()

    if not cfg["user"]:
        msg = "EMAIL_HOST_USER is not set in .env. Add your Gmail address to the .env file."
        logger.error("[SMTP] %s", msg)
        return False, msg

    if not cfg["password"]:
        msg = "EMAIL_HOST_PASSWORD is not set in .env. Add Gmail App Password to .env."
        logger.error("[SMTP] %s", msg)
        return False, msg

    from_email = cfg["from_email"] or cfg["user"]

    mime_msg = MIMEMultipart("alternative")
    mime_msg["Subject"] = subject
    mime_msg["From"] = from_email
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

        logger.info("[SMTP] Email successfully sent to %s (Subject: %s)", to_email, subject)
        return True, None

    except smtplib.SMTPAuthenticationError as exc:
        error = f"SMTP authentication failed (535): {exc}"
        logger.error("[SMTP] %s", error)
        return False, error
    except Exception as exc:
        error = f"Unexpected error sending email to {to_email}: {exc}"
        logger.exception("[SMTP] Exception")
        return False, error


def send_invitation_email(
    to_email: str,
    setup_link: str,
    company_name: str,
    invited_by: str,
) -> tuple[bool, str | None]:
    """Send recruiter invitation email."""
    subject = f"You are invited to join {company_name} as a Recruiter"
    plain_body = (
        f"Hello,\n\n"
        f"You have been invited by {invited_by} to join {company_name} "
        f"as a Recruiter on the AI Recruitment System.\n\n"
        f"Please set up your account and password by clicking the link below:\n"
        f"{setup_link}\n\n"
        f"This link will expire in 48 hours.\n\n"
        f"Best regards,\n"
        f"{company_name} Hiring Team"
    )

    html_body = (
        "<html><body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:30px;'>"
        "<div style='max-width:520px;margin:auto;background:#fff;border-radius:10px;"
        "padding:36px;box-shadow:0 2px 12px rgba(0,0,0,.08);'>"
        f"<h2 style='color:#2563eb;margin-top:0;'>You are Invited to {company_name}!</h2>"
        "<p>Hello,</p>"
        f"<p><strong>{invited_by}</strong> has invited you to join "
        f"<strong>{company_name}</strong> as a Recruiter on the "
        "<em>Nominate AI Recruitment System</em>.</p>"
        "<p>Click the button below to set up your account and password:</p>"
        "<p style='text-align:center;margin:28px 0;'>"
        f"<a href='{setup_link}' style='background:#2563eb;color:#fff;padding:12px 28px;"
        "border-radius:6px;text-decoration:none;font-weight:bold;'>Setup Your Account</a></p>"
        f"<p style='font-size:13px;color:#555;'>Or copy this link:<br>"
        f"<a href='{setup_link}' style='color:#2563eb;'>{setup_link}</a></p>"
        "<hr style='border:none;border-top:1px solid #eee;margin:24px 0;'>"
        "<p style='font-size:12px;color:#888;'>This invitation link expires in 48 hours.<br>"
        "If you did not expect this email, you can safely ignore it.</p>"
        f"<p style='color:#555;'>Best regards,<br><strong>{company_name} Hiring Team</strong></p>"
        "</div></body></html>"
    )

    return _send_smtp_email(to_email, subject, plain_body, html_body)


def send_registration_submitted_email(
    to_email: str,
    company_name: str,
    owner_name: str,
) -> tuple[bool, str | None]:
    """Send confirmation to company that registration & documents are under review."""
    subject = f"Registration Received — {company_name} Verification Under Process"
    plain_body = (
        f"Hello {owner_name},\n\n"
        f"Thank you for registering {company_name} on Nominate AI Recruitment System.\n\n"
        f"Your legal verification document has been securely received and uploaded for compliance review.\n"
        f"Our administration team is currently reviewing your registration details.\n\n"
        f"You will receive an update email once your registration has been approved.\n\n"
        f"Best regards,\n"
        f"Nominate AI Support & Verification Team"
    )

    html_body = (
        "<html><body style='font-family:Arial,sans-serif;background:#0d1117;padding:30px;color:#c9d1d9;'>"
        "<div style='max-width:540px;margin:auto;background:#161b22;border:1px solid #30363d;border-radius:12px;"
        "padding:36px;box-shadow:0 8px 24px rgba(0,0,0,.4);'>"
        "<div style='margin-bottom:20px;display:flex;align-items:center;'>"
        "<h2 style='color:#58a6ff;margin:0;font-size:22px;'>Nominate AI</h2>"
        "</div>"
        f"<h3 style='color:#f0f6fc;margin-top:0;'>Registration Under Review</h3>"
        f"<p>Hello <strong>{owner_name}</strong>,</p>"
        f"<p>Thank you for submitting registration details for <strong>{company_name}</strong>.</p>"
        "<div style='background:#1f242c;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:6px;margin:20px 0;'>"
        "<p style='margin:0;color:#fcd34d;font-size:14px;line-height:1.5;'>"
        "<strong>Status: Under Review</strong><br>"
        "Your legal verification document (SECP / NTN Certificate) has been uploaded to our secure storage. "
        "Our compliance administrators are reviewing your submission."
        "</p>"
        "</div>"
        "<p style='font-size:14px;line-height:1.6;'>Once reviewed, you will receive an email confirmation with your verification outcome.</p>"
        "<hr style='border:none;border-top:1px solid #30363d;margin:24px 0;'>"
        "<p style='font-size:12px;color:#8b949e;margin-bottom:0;'>"
        "Need help? Contact our support team.<br>"
        "© Nominate AI. All rights reserved."
        "</p>"
        "</div></body></html>"
    )

    return _send_smtp_email(to_email, subject, plain_body, html_body)


def send_company_approved_email(
    to_email: str,
    company_name: str,
    owner_name: str,
) -> tuple[bool, str | None]:
    """Send approval email when company registration is approved by admin."""
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    login_url = f"{frontend_url}/login"

    subject = f"Congratulations! {company_name} Registration Approved"
    plain_body = (
        f"Hello {owner_name},\n\n"
        f"Great news! Your company registration for {company_name} has been verified and APPROVED by our admin team.\n\n"
        f"You can now sign in to your dashboard, post jobs, and invite recruiters:\n"
        f"{login_url}\n\n"
        f"Best regards,\n"
        f"Nominate AI Team"
    )

    html_body = (
        "<html><body style='font-family:Arial,sans-serif;background:#0d1117;padding:30px;color:#c9d1d9;'>"
        "<div style='max-width:540px;margin:auto;background:#161b22;border:1px solid #30363d;border-radius:12px;"
        "padding:36px;box-shadow:0 8px 24px rgba(0,0,0,.4);'>"
        "<div style='margin-bottom:20px;'>"
        "<h2 style='color:#58a6ff;margin:0;font-size:22px;'>Nominate AI</h2>"
        "</div>"
        f"<h3 style='color:#3fb950;margin-top:0;'>✓ Company Verified & Approved</h3>"
        f"<p>Hello <strong>{owner_name}</strong>,</p>"
        f"<p>We are pleased to inform you that <strong>{company_name}</strong> has passed document verification and is now officially verified on Nominate AI.</p>"
        "<div style='background:#1f2923;border-left:4px solid #2ea043;padding:14px 16px;border-radius:6px;margin:20px 0;'>"
        "<p style='margin:0;color:#7ee787;font-size:14px;line-height:1.5;'>"
        "<strong>Your account is fully activated.</strong><br>"
        "You have full access to AI candidate ranking, job posting, recruiter invitations, and pipeline workflows."
        "</p>"
        "</div>"
        "<p style='text-align:center;margin:30px 0;'>"
        f"<a href='{login_url}' style='background:#238636;color:#ffffff;padding:12px 30px;"
        "border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;'>Go to Dashboard</a></p>"
        "<hr style='border:none;border-top:1px solid #30363d;margin:24px 0;'>"
        "<p style='font-size:12px;color:#8b949e;margin-bottom:0;'>"
        "© Nominate AI. All rights reserved."
        "</p>"
        "</div></body></html>"
    )

    return _send_smtp_email(to_email, subject, plain_body, html_body)


def send_company_rejected_email(
    to_email: str,
    company_name: str,
    owner_name: str,
    reason: str = "",
) -> tuple[bool, str | None]:
    """Send rejection notification email with reason."""
    subject = f"Registration Status Update — {company_name}"
    reason_text = reason if reason else "Document verification requirements were not fulfilled or the document was illegible."
    
    plain_body = (
        f"Hello {owner_name},\n\n"
        f"We have completed review of the registration request for {company_name}.\n\n"
        f"Status: Rejected\n"
        f"Reason: {reason_text}\n\n"
        f"If you believe this is an error or would like to submit updated legal documentation, please contact our support team.\n\n"
        f"Best regards,\n"
        f"Nominate AI Verification Team"
    )

    html_body = (
        "<html><body style='font-family:Arial,sans-serif;background:#0d1117;padding:30px;color:#c9d1d9;'>"
        "<div style='max-width:540px;margin:auto;background:#161b22;border:1px solid #30363d;border-radius:12px;"
        "padding:36px;box-shadow:0 8px 24px rgba(0,0,0,.4);'>"
        "<div style='margin-bottom:20px;'>"
        "<h2 style='color:#58a6ff;margin:0;font-size:22px;'>Nominate AI</h2>"
        "</div>"
        f"<h3 style='color:#f85149;margin-top:0;'>Registration Request Update</h3>"
        f"<p>Hello <strong>{owner_name}</strong>,</p>"
        f"<p>Thank you for your interest in registering <strong>{company_name}</strong> on Nominate AI.</p>"
        "<div style='background:#2a1c1d;border-left:4px solid #da3633;padding:14px 16px;border-radius:6px;margin:20px 0;'>"
        "<p style='margin:0;color:#ff7b72;font-size:14px;line-height:1.5;'>"
        f"<strong>Status: Rejected</strong><br>"
        f"<strong>Reason:</strong> {reason_text}"
        "</p>"
        "</div>"
        "<p style='font-size:14px;line-height:1.6;'>If you need clarification or wish to re-submit updated documents, please contact our administration team.</p>"
        "<hr style='border:none;border-top:1px solid #30363d;margin:24px 0;'>"
        "<p style='font-size:12px;color:#8b949e;margin-bottom:0;'>"
        "© Nominate AI. All rights reserved."
        "</p>"
        "</div></body></html>"
    )

    return _send_smtp_email(to_email, subject, plain_body, html_body)
