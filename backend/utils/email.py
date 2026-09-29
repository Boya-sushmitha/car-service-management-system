import logging
from typing import List, Optional

from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def send_notification_email(to_email: str, subject: str, message: str, html_message: Optional[str] = None) -> bool:
    """Send an email using Django's configured backend.
    Returns True on success, False otherwise (logs the error)."""
    if not to_email:
        logger.warning("Attempted to send email with empty recipient")
        return False
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
            recipient_list=[to_email],
            fail_silently=False,
            html_message=html_message,
        )
        logger.info(f"Email sent to {to_email} – subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def send_registration_email(user, raw_password: str = "") -> bool:
    """Welcome email with login details (including password) and how to view car service details."""
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    display_name = (user.first_name or user.username).strip()
    subject = 'Your Car Service account is ready'
    message = (
        f"Hello {display_name},\n\n"
        f"Your account on the Car Management System has been created.\n\n"
        f"Login credentials:\n"
        f"  Username: {user.username}\n"
        f"  Email: {user.email}\n"
        f"  Password: {raw_password}\n\n"
        f"Sign in here: {frontend}/login\n\n"
        f"After you log in you can:\n"
        f"  • Add your car details\n"
        f"  • Request a service\n"
        f"  • Track garage status and service progress at {frontend}/services\n"
        f"  • See vehicle status at {frontend}/garage-status\n\n"
        f"We will send service updates (accepted, in progress, completed, pickup) to this same email: {user.email}\n\n"
        f"Thank you,\nCar Service Center\n"
    )
    html_message = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;line-height:1.5;color:#111">
      <h2>Welcome, {display_name}</h2>
      <p>Your account on the Car Management System has been created.</p>
      <p>
        <strong>Username:</strong> {user.username}<br>
        <strong>Email:</strong> {user.email}<br>
        <strong>Password:</strong> {raw_password}
      </p>
      <p>
        <a href="{frontend}/login" style="background:#4f46e5;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px">Sign in</a>
      </p>
      <p>After you log in you can add your car, request a service, and track progress:</p>
      <ul>
        <li><a href="{frontend}/services">Service requests &amp; progress</a></li>
        <li><a href="{frontend}/garage-status">Garage / vehicle status</a></li>
      </ul>
      <p>Future car service updates will be sent to <strong>{user.email}</strong>.</p>
      <p>Thank you,<br>Car Service Center</p>
    </div>
    """
    return send_notification_email(user.email, subject, message, html_message)


def send_service_details_email(to_email: str, username: str, subject: str, body_lines: List[str]) -> bool:
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    message = (
        f"Hello {username},\n\n"
        + "\n".join(body_lines)
        + f"\n\nView full details after login: {frontend}/services\n"
        + "\nThank you,\nCar Service Center\n"
    )
    items = "".join(f"<li>{line}</li>" for line in body_lines)
    html_message = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;line-height:1.5;color:#111">
      <p>Hello {username},</p>
      <ul>{items}</ul>
      <p><a href="{frontend}/services">View your car service details</a></p>
      <p>Thank you,<br>Car Service Center</p>
    </div>
    """
    return send_notification_email(to_email, subject, message, html_message)
