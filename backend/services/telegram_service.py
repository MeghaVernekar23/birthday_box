import os
import json
import urllib.request
import asyncio
from datetime import datetime, timedelta, timezone, time as dt_time

IST = timezone(timedelta(hours=5, minutes=30))
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the backend directory regardless of working directory
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")


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
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML",
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


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
            print(f"[Telegram] Sent to {chat_id}: {result}")
        except Exception as e:
            print(f"[Telegram] Error for {chat_id}: {e}")


async def _send_message_async(text: str) -> None:
    """Send a message to all configured Telegram chats (async via thread executor)."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _send_message_sync, text)


def build_booking_message(booking_data: dict, label: str = "New Booking") -> str:
    """Format a booking notification message."""
    payment_paid = booking_data.get('payment_paid')
    payment_line = f"\n<b>Amount Paid:</b> ₹{payment_paid}" if payment_paid else ""
    return (
        f"<b>{label}</b>\n\n"
        f"<b>Customer:</b> {booking_data['customer_name']}\n"
        f"<b>Phone:</b> {booking_data['phone_number']}\n"
        f"<b>Event Date:</b> {booking_data['event_date']}\n"
        f"<b>Time Slot:</b> {booking_data['time_slot']}\n"
        f"<b>Package:</b> {booking_data.get('package_name', '')}\n"
        f"<b>Celebration:</b> {booking_data.get('celebration_name', '')}\n"
        f"<b>Notes:</b> {booking_data.get('addons_note', '')}\n"
        f"<b>Status:</b> {booking_data.get('status', '')}"
        f"{payment_line}"
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
