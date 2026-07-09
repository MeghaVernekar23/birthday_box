"""
Birthday Reminder Script
------------------------
Runs daily. Checks if any bookings happened on (today + 3 days) last year,
i.e., today is 2026-07-09 → checks 2025-07-12 (3 days ahead, last year).
Sends reminder via REMINDERS_TELEGRAM_BOT_TOKEN to the same TELEGRAM_CHAT_ID list.

Logic:
    target_date = (today + 3 days).replace(year=today.year - 1)
    Query bookings WHERE event_date = target_date AND status not in ('cancelled')
    For each booking, send reminder message.
"""

import os
import sys
import json
import time
import logging
import urllib.request
from datetime import date, timedelta
from pathlib import Path

# Ensure backend directory is on path so imports work
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(dotenv_path=BACKEND_DIR / ".env")

from db.sessions import SessionLocal
from db.models.sqlalchemy_models import Booking, Customer, Package, CelebrationType

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
log = logging.getLogger(__name__)

REMINDER_BOT_TOKEN = os.getenv("REMINDERS_TELEGRAM_BOT_TOKEN", "")
CHAT_IDS_RAW = os.getenv("TELEGRAM_CHAT_ID", "")

CANCELLED_STATUSES = {"cancelled", "canceled"}


def _get_chat_ids() -> list[str]:
    try:
        parsed = json.loads(CHAT_IDS_RAW)
        if isinstance(parsed, list):
            return [str(c) for c in parsed]
        return [str(parsed)]
    except (json.JSONDecodeError, ValueError):
        return [CHAT_IDS_RAW] if CHAT_IDS_RAW else []


def send_message(text: str, chat_id: str, token: str) -> None:
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }).encode("utf-8")
    req = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read())
        log.info(f"Sent to {chat_id}: message_id={result.get('result', {}).get('message_id')}")


def send_reminders_for_date(target_date: date) -> int:
    """
    Query bookings on target_date, send reminders.
    Returns number of reminders sent.
    """
    db = SessionLocal()
    sent = 0
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
            if (b.status or "").lower() not in CANCELLED_STATUSES
        ]

        if not non_cancelled:
            log.info(f"No bookings found for {target_date}.")
            return 0

        token = REMINDER_BOT_TOKEN
        chat_ids = _get_chat_ids()

        if not token:
            log.error("REMINDERS_TELEGRAM_BOT_TOKEN not set — cannot send reminders.")
            return 0
        if not chat_ids:
            log.error("TELEGRAM_CHAT_ID not set — cannot send reminders.")
            return 0

        for booking, customer, package, celebration in non_cancelled:
            anniversary_date = target_date.replace(year=target_date.year + 1)  # the upcoming date this year
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
                f"<b>{anniversary_date.strftime('%d %B %Y')}</b>? 🎉"
            )

            for chat_id in chat_ids:
                try:
                    send_message(message, chat_id, token)
                    sent += 1
                except Exception as e:
                    log.error(f"Failed to send to {chat_id}: {e}")

    finally:
        db.close()

    return sent


def run_once() -> None:
    today = date.today()
    # Check bookings that happened 3 days from today, last year
    # e.g. today=2026-07-09 → target=2025-07-12
    target_date = (today + timedelta(days=3)).replace(year=today.year - 1)
    log.info(f"Today: {today} | Checking bookings from: {target_date}")

    sent = send_reminders_for_date(target_date)
    log.info(f"Reminders sent: {sent}")


def run_daily(interval_seconds: int = 86400) -> None:
    """
    Run the check once per day (default every 24 hours).
    Blocks forever — run this as a background service or in a thread.
    """
    log.info("Birthday reminder service started. Runs every 24 hours.")
    while True:
        try:
            run_once()
        except Exception as e:
            log.error(f"Error during reminder run: {e}", exc_info=True)
        log.info(f"Sleeping {interval_seconds}s until next check...")
        time.sleep(interval_seconds)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Birthday Box — Anniversary Reminder")
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run check once and exit (useful for cron/Task Scheduler)",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=86400,
        help="Seconds between checks when running in loop mode (default: 86400 = 24h)",
    )
    args = parser.parse_args()

    if args.once:
        run_once()
    else:
        run_daily(interval_seconds=args.interval)
