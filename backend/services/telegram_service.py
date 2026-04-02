import os
import json
import httpx
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

def _get_chat_ids() -> list[str]:
    raw = os.getenv("TELEGRAM_CHAT_ID", "")
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(c) for c in parsed]
        return [str(parsed)]
    except (json.JSONDecodeError, ValueError):
        return [raw] if raw else []


def _telegram_api_url() -> str:
    return f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"


async def _send_message(text: str) -> None:
    """Send a message to all configured Telegram chats."""
    chat_ids = _get_chat_ids()
    if not TELEGRAM_BOT_TOKEN or not chat_ids:
        print("Telegram credentials not configured — skipping notification.")
        return

    async with httpx.AsyncClient() as client:
        for chat_id in chat_ids:
            response = await client.post(
                _telegram_api_url(),
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
            )
            if response.status_code != 200:
                print(f"Telegram send failed for {chat_id}: {response.text}")


def build_booking_message(booking_data: dict, label: str = "New Booking") -> str:
    """Format a booking notification message."""
    return (
        f"<b>{label}</b>\n\n"
        f"<b>Customer:</b> {booking_data['customer_name']}\n"
        f"<b>Phone:</b> {booking_data['phone_number']}\n"
        f"<b>Email:</b> {booking_data['email']}\n"
        f"<b>Address:</b> {booking_data['address']}\n"
        f"<b>Event Date:</b> {booking_data['event_date']}\n"
        f"<b>Time Slot:</b> {booking_data['time_slot']}\n"
        f"<b>Package:</b> {booking_data.get('package_name', '')}\n"
        f"<b>Celebration:</b> {booking_data.get('celebration_name', '')}\n"
        f"<b>Notes:</b> {booking_data.get('addons_note', '')}\n"
        f"<b>Payment Total:</b> ₹{booking_data.get('payment_total', 0)}\n"
        f"<b>Payment Paid:</b> ₹{booking_data.get('payment_paid', 0)}\n"
        f"<b>Payment Mode:</b> {booking_data.get('payment_mode', '')}\n"
        f"<b>Status:</b> {booking_data.get('status', '')}"
    )


async def _schedule_reminder(booking_data: dict, send_at: datetime, label: str) -> None:
    """Wait until send_at, then dispatch the reminder."""
    delay = (send_at - datetime.now()).total_seconds()
    if delay <= 0:
        return  # reminder time already passed
    await asyncio.sleep(delay)
    message = build_booking_message(booking_data, label=label)
    await _send_message(message)


def schedule_reminders(booking_data: dict, event_datetime: datetime) -> None:
    """
    Schedule the 24-hour and 5-hour reminders for a booking.
    Fires-and-forgets two async tasks on the running event loop.
    """
    remind_24h = event_datetime - timedelta(hours=24)
    remind_5h = event_datetime - timedelta(hours=5)

    loop = asyncio.get_event_loop()
    loop.create_task(
        _schedule_reminder(booking_data, remind_24h, "⏰ Reminder: Booking in 24 Hours")
    )
    loop.create_task(
        _schedule_reminder(booking_data, remind_5h, "⏰ Reminder: Booking in 5 Hours")
    )


async def notify_new_booking(booking_data: dict) -> None:
    """Send the immediate new-booking notification."""
    message = build_booking_message(booking_data, label="🎉 New Booking Confirmed")
    await _send_message(message)
