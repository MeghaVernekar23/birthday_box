"""Booking lifecycle: auto-unconfirm and reactivation.

Rule: a booking still "pending" when only 24 hours are left before the event is
set to "unconfirmed" — a Telegram message is sent first. Unconfirmed bookings
get no reminders and are left out of dashboard figures. The owner can
reactivate one (it becomes "confirmed").

Bookings created less than 24 hours before their event are not auto-unconfirmed
(they never had a 24-hour window to be confirmed in).
"""
import logging
from datetime import datetime, timedelta, timezone, date

from db.models.sqlalchemy_models import Booking

log = logging.getLogger(__name__)

IST = timezone(timedelta(hours=5, minutes=30))
UNCONFIRM_WINDOW = timedelta(hours=24)

PENDING = "pending"
CONFIRMED = "confirmed"
UNCONFIRMED = "unconfirmed"
# Statuses that should never trigger reminders and are excluded from figures.
INACTIVE_STATUSES = {"cancelled", "canceled", UNCONFIRMED}
# Statuses that receive reminders.
REMINDABLE_STATUSES = {CONFIRMED, "completed"}


def event_datetime(event_date: date, event_time: str) -> datetime | None:
    """Combine a booking's date and its time string ("5:00 PM", "17:00") into an IST datetime."""
    if not event_date:
        return None
    for fmt in ("%I:%M %p", "%I:%M%p", "%H:%M", "%H:%M:%S"):
        try:
            t = datetime.strptime((event_time or "").strip(), fmt).time()
            return datetime.combine(event_date, t, tzinfo=IST)
        except ValueError:
            continue
    return datetime.combine(event_date, datetime.min.time(), tzinfo=IST)


def _created_at_utc(booking: Booking) -> datetime | None:
    c = booking.created_at
    if c is None:
        return None
    # created_at is stored as naive UTC
    return c if c.tzinfo else c.replace(tzinfo=timezone.utc)


def should_unconfirm(booking: Booking, now: datetime | None = None) -> bool:
    if (booking.status or "").lower() != PENDING:
        return False
    now = now or datetime.now(IST)
    ev = event_datetime(booking.event_date, booking.event_time)
    if ev is None or not (now < ev <= now + UNCONFIRM_WINDOW):
        return False
    created = _created_at_utc(booking)
    # booked after the 24h mark -> leave it alone
    return created is None or created <= ev - UNCONFIRM_WINDOW


def _booking_message_data(booking_id: int, db) -> dict | None:
    from services.bookings_service import get_booking_details_by_id
    try:
        b = get_booking_details_by_id(booking_id, db)
    except Exception:
        return None
    return {
        "booking_id": b.booking_id,
        "customer_name": b.customer_name,
        "phone_number": b.phone_number,
        "email": b.email,
        "address": b.address,
        "event_date": str(b.event_date),
        "time_slot": b.time_slot,
        "package_name": b.package_name,
        "celebration_name": b.celebration_name,
        "addons_note": b.addons_note,
        "payment_total": b.payment_total,
        "payment_paid": b.payment_paid,
        "payment_mode": b.payment_mode,
        "status": b.status,
    }


def unconfirm_booking(booking: Booking, db) -> bool:
    """Send the Telegram notice, then mark the booking unconfirmed."""
    from services.telegram_service import build_booking_message, _send_message_sync

    data = _booking_message_data(booking.booking_id, db) or {}
    if data:
        data["status"] = UNCONFIRMED
        message = build_booking_message(data, label="⚠️ Booking set as UNCONFIRMED")
        message += (
            "\n\n❗ <b>Not confirmed 24 hours before the event.</b>"
            "\nNo reminders will be sent and it is excluded from dashboard figures."
            "\nIf the customer confirms, reactivate it from Upcoming/Today's bookings."
        )
        _send_message_sync(message)  # message first, then the status change

    booking.status = UNCONFIRMED
    booking.updated_at = datetime.now(timezone.utc)
    db.commit()
    log.info(f"[Unconfirm] Booking {booking.booking_id} set to unconfirmed.")
    return True


def unconfirm_due_bookings() -> int:
    """Periodic sweep: unconfirm every pending booking that is inside its last 24 hours."""
    from db.sessions import SessionLocal

    now = datetime.now(IST)
    db = SessionLocal()
    count = 0
    try:
        candidates = (
            db.query(Booking)
            .filter(Booking.status == PENDING)
            .filter(Booking.event_date >= now.date())
            .filter(Booking.event_date <= (now + UNCONFIRM_WINDOW).date())
            .all()
        )
        for b in candidates:
            if should_unconfirm(b, now):
                unconfirm_booking(b, db)
                count += 1
    finally:
        db.close()
    return count


def reactivate_booking(booking_id: int, db) -> Booking:
    """Owner reactivates an unconfirmed booking: it becomes confirmed again."""
    booking = db.get(Booking, booking_id)
    if not booking:
        raise LookupError(f"Booking {booking_id} not found")
    if (booking.status or "").lower() != UNCONFIRMED:
        raise ValueError("Only unconfirmed bookings can be reactivated.")
    booking.status = CONFIRMED
    booking.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(booking)
    return booking
