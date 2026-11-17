"""Booking status: manual unconfirm / reactivate.

Every new booking starts as "confirmed". Staff can unconfirm a booking from the
booking pages; unconfirmed bookings get no Telegram reminders and are left out
of dashboard figures. Reactivating sets it back to "confirmed".
Nothing changes status automatically.
"""
import logging
from datetime import datetime, timedelta, timezone, date

from db.models.sqlalchemy_models import Booking

log = logging.getLogger(__name__)

IST = timezone(timedelta(hours=5, minutes=30))

CONFIRMED = "confirmed"
UNCONFIRMED = "unconfirmed"
# No reminders and excluded from figures.
INACTIVE_STATUSES = {"cancelled", "canceled", UNCONFIRMED}


def is_active(status: str | None) -> bool:
    return (status or "").lower() not in INACTIVE_STATUSES


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


def booking_message_data(booking_id: int, db) -> dict | None:
    """Current booking details in the shape build_booking_message expects."""
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


def _set_status(booking_id: int, db, new_status: str, allowed_from) -> Booking:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise LookupError(f"Booking {booking_id} not found")
    if not allowed_from((booking.status or "").lower()):
        raise ValueError(f"Booking is '{booking.status}' and can't be set to {new_status}.")
    booking.status = new_status
    booking.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(booking)
    log.info(f"[Status] Booking {booking_id} -> {new_status}")
    return booking


def unconfirm_booking(booking_id: int, db) -> Booking:
    """Staff unconfirm: reminders stop, booking leaves dashboard figures."""
    return _set_status(booking_id, db, UNCONFIRMED, lambda s: s not in {UNCONFIRMED, "cancelled", "canceled"})


def reactivate_booking(booking_id: int, db) -> Booking:
    """Staff reactivate an unconfirmed booking: it becomes confirmed again."""
    return _set_status(booking_id, db, CONFIRMED, lambda s: s == UNCONFIRMED)
