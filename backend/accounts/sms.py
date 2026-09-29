"""
SMS Utility — Fast2SMS Integration (India)
Sends real SMS messages to Indian mobile numbers via Fast2SMS.

Setup (takes 2 minutes, completely FREE):
  1. Go to https://www.fast2sms.com and click "Sign Up"
  2. Enter your mobile number and verify it
  3. In the dashboard, go to "Dev API" section
  4. Copy your API Authorization Key
  5. Open backend/car_management/settings.py and:
       - Paste your key: FAST2SMS_API_KEY = 'your_key_here'
       - Enable SMS:     SMS_ENABLED = True
  6. Done! Real SMS will now be sent on service completion.
"""

import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2'


def _clean_phone(phone: str) -> str:
    """Strip country code and spaces, return 10-digit Indian mobile number."""
    phone = phone.strip().replace(' ', '').replace('-', '')
    # Remove +91 or 91 prefix if present
    if phone.startswith('+91'):
        phone = phone[3:]
    elif phone.startswith('91') and len(phone) == 12:
        phone = phone[2:]
    return phone


def send_sms(to_number: str, message: str) -> dict:
    """
    Send an SMS via Fast2SMS.
    Returns {'success': True/False, 'sid': ..., 'error': ...}
    """
    if not getattr(settings, 'SMS_ENABLED', False):
        logger.info(f"[SMS DISABLED] Would send to {to_number}: {message}")
        return {'success': False, 'error': 'SMS_ENABLED is False in settings.py'}

    if not to_number or not to_number.strip():
        logger.warning("[SMS] No phone number provided, skipping.")
        return {'success': False, 'error': 'No phone number provided.'}

    api_key = getattr(settings, 'FAST2SMS_API_KEY', '')
    if not api_key or api_key == 'YOUR_FAST2SMS_API_KEY_HERE':
        logger.error("[SMS] Fast2SMS API key not configured in settings.py")
        return {'success': False, 'error': 'Fast2SMS API key not set in settings.py'}

    mobile = _clean_phone(to_number)
    if len(mobile) != 10 or not mobile.isdigit():
        logger.warning(f"[SMS] Invalid phone number format: {to_number}")
        return {'success': False, 'error': f'Invalid Indian mobile number: {to_number}. Must be 10 digits.'}

    try:
        payload = {
            'authorization': api_key,
            'message': message,
            'language': 'english',
            'route': 'q',          # 'q' = Quick SMS (transactional)
            'numbers': mobile,
        }
        headers = {
            'cache-control': 'no-cache',
        }
        response = requests.post(FAST2SMS_URL, data=payload, headers=headers, timeout=10)
        result = response.json()

        if result.get('return') is True:
            request_id = result.get('request_id', 'N/A')
            logger.info(f"[SMS] ✅ Sent to {mobile}, request_id={request_id}")
            return {'success': True, 'sid': request_id}
        else:
            error_msg = str(result.get('message', result))
            logger.error(f"[SMS] ❌ Failed: {error_msg}")
            return {'success': False, 'error': error_msg}

    except requests.exceptions.Timeout:
        logger.error("[SMS] Request timed out")
        return {'success': False, 'error': 'SMS request timed out.'}
    except Exception as e:
        logger.error(f"[SMS] Exception: {e}")
        return {'success': False, 'error': str(e)}


def send_service_completion_sms(user_name: str, phone_number: str, car_info: str, cost) -> dict:
    """
    Send a professional service completion SMS to the customer.
    """
    message = (
        f"Dear {user_name}, "
        f"your car service for {car_info} is COMPLETED! "
        f"Amount: Rs.{cost}. "
        f"Your vehicle is ready for pickup. "
        f"Thank you! - Car Service Center"
    )
    return send_sms(phone_number, message)
