import os
import json
import logging
import urllib.request
import asyncio
import requests as _requests
from datetime import datetime, timedelta, timezone, date, time as dt_time

IST = timezone(timedelta(hours=5, minutes=30))
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the backend directory regardless of working directory
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

log = logging.getLogger(__name__)


def _get_token() -> str:
    return os.getenv("TELEGRAM_BOT_TOKEN", "")


def _get_chat_ids() -> list[str]:
    raw = os.getenv("TELEGRAM_CHAT_ID", "")
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(c) for c in parsed]
        return [str(parsed)]
    except (json.JSONDecodeError, ValueError):
        return [raw] if raw else []


def send_telegram_message(message: str, chat_id: str, bot_token: str) -> dict:
    """Send a single Telegram message via the Bot API."""
    import time
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message, "parse_mode": "HTML"}
    for attempt in range(3):
        try:
            resp = _requests.post(url, json=payload, timeout=15)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            if attempt < 2:
                time.sleep(2 ** attempt)  # 1s, 2s
            else:
                raise


def _send_message_sync(text: str) -> None:
    token = _get_token()
    chat_ids = _get_chat_ids()
    print(f"[Telegram] token={'SET' if token else 'MISSING'}, chat_ids={chat_ids}")
    if not token or not chat_ids:
        print("[Telegram] Credentials not configured — skipping.")
        return

    for chat_id in chat_ids:
        try:
            result = send_telegram_message(text, chat_id, token)
            msg_id = result.get("result", {}).get("message_id", "?")
            print(f"[Telegram] Sent to {chat_id}: message_id={msg_id}")
        except Exception as e:
            print(f"[Telegram] Error for {chat_id}: {type(e).__name__}: {str(e).encode('ascii', errors='replace').decode()}")


async def _send_message_async(text: str) -> None:
    """Send a message to all configured Telegram chats (async via thread executor)."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _send_message_sync, text)


def build_booking_message(booking_data: dict, label: str = "New Booking") -> str:
    """Format a booking notification message."""
    payment_total = booking_data.get('payment_total') or 0
    payment_paid = booking_data.get('payment_paid') or 0
    payment_left = max(0, payment_total - payment_paid)

    payment_lines = ""
    if payment_total > 0:
        payment_lines += f"\n<b>Total Amount:</b> ₹{payment_total:,.0f}"
    if payment_paid > 0:
        payment_lines += f"\n<b>Amount Paid:</b> ₹{payment_paid:,.0f}"
        payment_lines += f"\n<b>Amount Left:</b> ₹{payment_left:,.0f}"

    addons_note = booking_data.get('addons_note', '')
    staff_note = ""
    if addons_note and "BOOKED BY STAFF" in addons_note:
        staff_note = "\n\n⚠️ <b>NOTE: Booked by staff — please cross check</b>"

    return (
        f"<b>{label}</b>\n\n"
        f"<b>Customer:</b> {booking_data['customer_name']}\n"
        f"<b>Phone:</b> {booking_data['phone_number']}\n"
        f"<b>Event Date:</b> {booking_data['event_date']}\n"
        f"<b>Time Slot:</b> {booking_data['time_slot']}\n"
        f"<b>Package:</b> {booking_data.get('package_name', '')}\n"
        f"<b>Celebration:</b> {booking_data.get('celebration_name', '')}\n"
        f"<b>Notes:</b> {addons_note}\n"
        f"<b>Status:</b> {booking_data.get('status', '')}"
        f"{payment_lines}"
        f"{staff_note}"
    )


async def _schedule_reminder(booking_data: dict, send_at: datetime, label: str) -> None:
    """Wait until send_at, then dispatch the reminder."""
    now = datetime.now(IST)
    send_at_aware = send_at if send_at.tzinfo else send_at.replace(tzinfo=IST)
    delay = (send_at_aware - now).total_seconds()
    if delay <= 0:
        return  # reminder time already passed
    await asyncio.sleep(delay)
    message = build_booking_message(booking_data, label=label)
    await _send_message_async(message)


async def schedule_reminders_async(booking_data: dict, event_datetime: datetime) -> None:
    """Schedule the 24-hour and 4-hour reminders for a booking."""
    remind_24h = event_datetime - timedelta(hours=24)
    remind_4h = event_datetime - timedelta(hours=4)
    await asyncio.gather(
        _schedule_reminder(booking_data, remind_24h, "⏰ Reminder: Booking in 24 Hours"),
        _schedule_reminder(booking_data, remind_4h, "⏰ Reminder: Booking in 4 Hours"),
    )


def notify_new_booking(booking_data: dict) -> None:
    """Send the immediate new-booking notification (synchronous)."""
    message = build_booking_message(booking_data, label="🎉 New Booking Confirmed")
    _send_message_sync(message)


def _get_reminders_token() -> str:
    return os.getenv("REMINDERS_TELEGRAM_BOT_TOKEN", "")


def _send_reminder_message(text: str) -> None:
    """Send via REMINDERS_TELEGRAM_BOT_TOKEN to all configured chat IDs."""
    token = _get_reminders_token()
    chat_ids = _get_chat_ids()
    if not token:
        log.error("[BirthdayReminder] REMINDERS_TELEGRAM_BOT_TOKEN not set.")
        return
    if not chat_ids:
        log.error("[BirthdayReminder] TELEGRAM_CHAT_ID not set.")
        return
    for chat_id in chat_ids:
        try:
            send_telegram_message(text, chat_id, token)
            log.info(f"[BirthdayReminder] Sent reminder to {chat_id}")
        except Exception as e:
            log.error(f"[BirthdayReminder] Failed to send to {chat_id}: {e}")


def check_and_send_anniversary_reminders() -> None:
    """
    Check bookings that occurred 3 days from today, last year.
    e.g. today=2026-07-09 → target=2025-07-12
    Send a reminder for each non-cancelled booking found.
    """
    # Import here to avoid circular imports at module load time
    from db.sessions import SessionLocal
    from db.models.sqlalchemy_models import Booking, Customer, Packages as Package, CelebrationType

    today = date.today()
    target_date = (today + timedelta(days=3)).replace(year=today.year - 1)
    log.info(f"[BirthdayReminder] Today={today}, checking bookings from {target_date}")

    db = SessionLocal()
    try:
        rows = (
            db.query(Booking, Customer, Package, CelebrationType)
            .join(Customer, Booking.customer_id == Customer.customer_id)
            .outerjoin(Package, Booking.package_id == Package.package_id)
            .outerjoin(CelebrationType, Booking.celebration_id == CelebrationType.celebration_id)
            .filter(Booking.event_date == target_date)
            .all()
        )

        non_cancelled = [
            (b, c, p, ct) for b, c, p, ct in rows
            if (b.status or "").lower() not in {"cancelled", "canceled"}
        ]

        if not non_cancelled:
            log.info(f"[BirthdayReminder] No bookings found for {target_date}.")
            return

        for booking, customer, package, celebration in non_cancelled:
            reminder_date = target_date.replace(year=today.year)
            package_name = package.package_name if package else "Unknown Package"
            celebration_name = celebration.celebration_name if celebration else "Unknown Celebration"

            message = (
                f"🎂 <b>Birthday Box — Anniversary Reminder</b>\n\n"
                f"This customer celebrated with us last year on <b>{target_date.strftime('%d %B %Y')}</b>!\n\n"
                f"<b>Customer:</b> {customer.name}\n"
                f"<b>Phone:</b> {customer.phone_number}\n"
                f"<b>Package:</b> {package_name}\n"
                f"<b>Celebration:</b> {celebration_name}\n\n"
                f"Why don't we remind them to celebrate with us again on "
                f"<b>{reminder_date.strftime('%d %B %Y')}</b>? 🎉"
            )
            _send_reminder_message(message)

    finally:
        db.close()


async def run_daily_birthday_reminders() -> None:
    """
    Asyncio task started at server startup.
    Waits until 9 AM IST, then checks for anniversary reminders every 24 hours.
    """
    while True:
        now = datetime.now(IST)
        next_run = now.replace(hour=9, minute=0, second=0, microsecond=0)
        if now >= next_run:
            next_run += timedelta(days=1)
        delay = (next_run - now).total_seconds()
        log.info(f"[BirthdayReminder] Next check at {next_run.strftime('%Y-%m-%d %H:%M %Z')} (in {delay:.0f}s)")
        await asyncio.sleep(delay)
        try:
            await asyncio.get_event_loop().run_in_executor(None, check_and_send_anniversary_reminders)
        except Exception as e:
            log.error(f"[BirthdayReminder] Error during reminder check: {e}", exc_info=True)
