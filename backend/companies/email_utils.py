"""
companies/email_utils.py
------------------------
Sends recruiter invitation emails via Python's built-in smtplib so we get
exact SMTP-level error messages for debugging.

Usage
-----
    from companies.email_utils import send_invitation_email

    ok, err = send_invitation_email(
        to_email="recruit@example.com",
        setup_link="https://...",
        company_name="Acme Corp",
        invited_by="admin@acme.com",
    )

Returns
-------
    (True, None)      on success
    (False, "reason") on any failure
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


def send_invitation_email(
    to_email: str,
    setup_link: str,
    company_name: str,
    invited_by: str,
) -> tuple[bool, str | None]:
    """
    Send recruiter invitation email using smtplib directly.

    Returns (True, None) on success, (False, error_message) on failure.
    All steps are logged at DEBUG level so you can trace the full SMTP
    handshake in the Django dev-server console.
    """
    cfg = _get_smtp_config()

    # -- Credential guard -------------------------------------------------------
    if not cfg["user"]:
        msg = (
            "EMAIL_HOST_USER is not set in .env. "
            "Add your Gmail address to the .env file."
        )
        logger.error("[SMTP] %s", msg)
        return False, msg

    if not cfg["password"]:
        msg = (
            "EMAIL_HOST_PASSWORD is not set in .env. "
            "Generate a Gmail App Password at "
            "https://myaccount.google.com/apppasswords and add it to .env."
        )
        logger.error("[SMTP] %s", msg)
        return False, msg

    from_email = cfg["from_email"] or cfg["user"]

    # -- Build the message -------------------------------------------------------
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
        "<em>AI Recruitment System</em>.</p>"
        "<p>Click the button below to set up your account and password:</p>"
        "<p style='text-align:center;margin:28px 0;'>"
        f"<a href='{setup_link}' style='background:#2563eb;color:#fff;padding:12px 28px;"
        "border-radius:6px;text-decoration:none;font-weight:bold;'>Set Up My Account</a></p>"
        f"<p style='font-size:13px;color:#555;'>Or copy this link:<br>"
        f"<a href='{setup_link}' style='color:#2563eb;'>{setup_link}</a></p>"
        "<hr style='border:none;border-top:1px solid #eee;margin:24px 0;'>"
        "<p style='font-size:12px;color:#888;'>This invitation link expires in 48 hours.<br>"
        "If you did not expect this email, you can safely ignore it.</p>"
        f"<p style='color:#555;'>Best regards,<br><strong>{company_name} Hiring Team</strong></p>"
        "</div></body></html>"
    )

    mime_msg = MIMEMultipart("alternative")
    mime_msg["Subject"] = subject
    mime_msg["From"] = from_email
    mime_msg["To"] = to_email
    mime_msg.attach(MIMEText(plain_body, "plain"))
    mime_msg.attach(MIMEText(html_body, "html"))

    # -- SMTP connection --------------------------------------------------------
    logger.debug(
        "[SMTP] Connecting to %s:%s  TLS=%s  SSL=%s  user=%s  from=%s  to=%s",
        cfg["host"], cfg["port"], cfg["use_tls"], cfg["use_ssl"],
        cfg["user"], from_email, to_email,
    )

    try:
        if cfg["use_ssl"]:
            logger.debug("[SMTP] Using SMTP_SSL (port 465 style)")
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(cfg["host"], cfg["port"], context=context) as server:
                server.set_debuglevel(1)
                logger.debug("[SMTP] Logging in as %s", cfg["user"])
                server.login(cfg["user"], cfg["password"])
                logger.debug("[SMTP] Sending message to %s", to_email)
                server.sendmail(from_email, [to_email], mime_msg.as_string())
        else:
            logger.debug("[SMTP] Using SMTP + STARTTLS (port 587 style)")
            with smtplib.SMTP(cfg["host"], cfg["port"]) as server:
                server.set_debuglevel(1)
                server.ehlo()
                if cfg["use_tls"]:
                    logger.debug("[SMTP] Starting TLS")
                    server.starttls(context=ssl.create_default_context())
                    server.ehlo()
                logger.debug("[SMTP] Logging in as %s", cfg["user"])
                server.login(cfg["user"], cfg["password"])
                logger.debug("[SMTP] Sending message to %s", to_email)
                server.sendmail(from_email, [to_email], mime_msg.as_string())

        logger.info("[SMTP] Invitation email successfully sent to %s", to_email)
        return True, None

    except smtplib.SMTPAuthenticationError as exc:
        error = (
            "SMTP authentication failed (535). "
            "For Gmail you MUST use a 16-character App Password, not your "
            "regular login password. Generate one at "
            "https://myaccount.google.com/apppasswords "
            "and set EMAIL_HOST_PASSWORD in your .env file. "
            f"Raw server error: {exc}"
        )
        logger.error("[SMTP] Auth error: %s", exc)
        return False, error

    except smtplib.SMTPRecipientsRefused as exc:
        error = f"Recipient address refused by SMTP server: {exc}"
        logger.error("[SMTP] Recipient refused: %s", exc)
        return False, error

    except smtplib.SMTPSenderRefused as exc:
        error = (
            f"Sender address {from_email!r} was refused. "
            "Ensure EMAIL_HOST_USER in .env matches your Gmail account. "
            f"Raw error: {exc}"
        )
        logger.error("[SMTP] Sender refused: %s", exc)
        return False, error

    except smtplib.SMTPConnectError as exc:
        host, port = cfg["host"], cfg["port"]
        error = f"Could not connect to SMTP server {host}:{port}. Raw error: {exc}"
        logger.error("[SMTP] Connect error: %s", exc)
        return False, error

    except smtplib.SMTPException as exc:
        error = f"SMTP error: {exc}"
        logger.error("[SMTP] SMTPException: %s", exc)
        return False, error

    except OSError as exc:
        error = f"Network/OS error while connecting to SMTP: {exc}"
        logger.error("[SMTP] OSError: %s", exc)
        return False, error

    except Exception as exc:  # noqa: BLE001
        error = f"Unexpected error sending email: {exc}"
        logger.exception("[SMTP] Unexpected exception")
        return False, error
