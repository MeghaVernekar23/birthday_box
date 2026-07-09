"""
APScheduler-based persistent reminder service.
Replaces the asyncio.sleep approach so reminders survive server restarts.
"""

import logging
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore

log = logging.getLogger(__name__)

IST = timezone(timedelta(hours=5, minutes=30))

_scheduler: AsyncIOScheduler | None = None


def get_scheduler() -> AsyncIOScheduler:
    global _scheduler
    if _scheduler is None:
        jobstores = {
            "default": SQLAlchemyJobStore(url="sqlite:///./birthdayBox.db")
        }
        _scheduler = AsyncIOScheduler(jobstores=jobstores, timezone=IST)
    return _scheduler


def start_scheduler() -> None:
    scheduler = get_scheduler()
    if not scheduler.running:
        scheduler.start()
        log.info("[Scheduler] APScheduler started.")


def stop_scheduler() -> None:
    scheduler = get_scheduler()
    if scheduler.running:
        scheduler.shutdown(wait=False)
        log.info("[Scheduler] APScheduler stopped.")


def _send_reminder_job(booking_data: dict, label: str) -> None:
    """Synchronous job function called by APScheduler."""
    from services.telegram_service import build_booking_message, _send_message_sync
    message = build_booking_message(booking_data, label=label)
    _send_message_sync(message)


def schedule_booking_reminders(booking_data: dict, event_datetime: datetime) -> None:
    """
    Schedule 24h and 4h reminders for a booking via APScheduler.
    Jobs are persisted to SQLite — survive server restarts.
    """
    scheduler = get_scheduler()

    event_dt_aware = (
        event_datetime if event_datetime.tzinfo else event_datetime.replace(tzinfo=IST)
    )
    remind_24h = event_dt_aware - timedelta(hours=24)
    remind_4h = event_dt_aware - timedelta(hours=4)
    now = datetime.now(IST)

    booking_id = booking_data.get("booking_id", "unknown")

    if remind_24h > now:
        scheduler.add_job(
            _send_reminder_job,
            trigger="date",
            run_date=remind_24h,
            args=[booking_data, "⏰ Reminder: Booking in 24 Hours"],
            id=f"reminder_24h_{booking_id}",
            replace_existing=True,
        )
        log.info(f"[Scheduler] 24h reminder scheduled for booking {booking_id} at {remind_24h}")
    else:
        log.info(f"[Scheduler] 24h reminder skipped for booking {booking_id} — time already passed.")

    if remind_4h > now:
        scheduler.add_job(
            _send_reminder_job,
            trigger="date",
            run_date=remind_4h,
            args=[booking_data, "⏰ Reminder: Booking in 4 Hours"],
            id=f"reminder_4h_{booking_id}",
            replace_existing=True,
        )
        log.info(f"[Scheduler] 4h reminder scheduled for booking {booking_id} at {remind_4h}")
    else:
        log.info(f"[Scheduler] 4h reminder skipped for booking {booking_id} — time already passed.")
