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
        # misfire_grace_time: a reminder due while the server was down still goes out
        # (up to an hour late) instead of being silently dropped.
        _scheduler = AsyncIOScheduler(
            jobstores=jobstores,
            timezone=IST,
            job_defaults={"misfire_grace_time": 3600, "coalesce": True},
        )
    return _scheduler


def start_scheduler() -> None:
    scheduler = get_scheduler()
    if not scheduler.running:
        scheduler.start()
        log.info("[Scheduler] APScheduler started.")
    # Safety net for the 24h rule (server restarts, edited dates, missed jobs).
    scheduler.add_job(
        _unconfirm_sweep_job,
        trigger="interval",
        minutes=10,
        id="unconfirm_sweep",
        replace_existing=True,
        next_run_time=datetime.now(IST) + timedelta(seconds=30),
    )


def stop_scheduler() -> None:
    scheduler = get_scheduler()
    if scheduler.running:
        scheduler.shutdown(wait=False)
        log.info("[Scheduler] APScheduler stopped.")


def _unconfirm_sweep_job() -> None:
    from services.booking_status_service import unconfirm_due_bookings
    n = unconfirm_due_bookings()
    if n:
        log.info(f"[Scheduler] Unconfirmed {n} booking(s).")


def _send_reminder_job(booking_data: dict, label: str) -> None:
    """
    Synchronous job function called by APScheduler.

    Looks the booking up again at fire time (status/date may have changed since
    it was scheduled):
      - deleted, cancelled or unconfirmed  -> no reminder
      - still pending at the 24h mark      -> Telegram notice, then set unconfirmed
      - pending at the 4h mark             -> no reminder
      - confirmed / completed              -> reminder with current details
    """
    from db.sessions import SessionLocal
    from db.models.sqlalchemy_models import Booking
    from services.telegram_service import build_booking_message, _send_message_sync
    from services.booking_status_service import (
        REMINDABLE_STATUSES, should_unconfirm, unconfirm_booking, _booking_message_data,
    )

    booking_id = booking_data.get("booking_id")
    db = SessionLocal()
    try:
        booking = db.get(Booking, booking_id) if booking_id else None
        if booking is None:
            log.info(f"[Scheduler] Reminder skipped: booking {booking_id} no longer exists.")
            return
        status = (booking.status or "").lower()
        if "24" in label and should_unconfirm(booking):
            unconfirm_booking(booking, db)
            return
        if status not in REMINDABLE_STATUSES:
            log.info(f"[Scheduler] Reminder skipped for booking {booking_id} (status={status}).")
            return
        fresh = _booking_message_data(booking_id, db) or booking_data
        message = build_booking_message(fresh, label=label)
    finally:
        db.close()
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
