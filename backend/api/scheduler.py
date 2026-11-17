"""Read-only view of the Telegram messages the backend is going to send."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.sessions import get_db
from db.models.sqlalchemy_models import Booking, Customer
from services.oauth import get_current_user
from services.scheduler_service import get_scheduler, IST
from services.booking_status_service import is_active


scheduler_router = APIRouter(prefix="/scheduler", tags=["Scheduler"])


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    # The public booking form logs in as the "customer" account; keep it out.
    if (user.get("role") or "").lower() == "customer":
        raise HTTPException(status_code=403, detail="Not allowed.")
    return user


def _next_daily(hour: int, minute: int) -> datetime:
    """Same timing rule as the daily asyncio tasks in telegram_service."""
    now = datetime.now(IST)
    nxt = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    return nxt if now < nxt else nxt + timedelta(days=1)


@scheduler_router.get(
    "/messages",
    dependencies=[Depends(require_admin)],
    description="List upcoming scheduled Telegram messages (booking reminders + daily messages). Read-only.",
)
def list_scheduled_messages(db: Session = Depends(get_db)) -> dict:
    reminders = []
    for job in get_scheduler().get_jobs():
        if not job.id.startswith("reminder_"):
            continue
        booking_data = job.args[0] if job.args else {}
        label = job.args[1] if len(job.args) > 1 else job.id
        booking_id = booking_data.get("booking_id")

        booking = db.get(Booking, booking_id) if booking_id else None
        customer = db.get(Customer, booking.customer_id) if booking else None

        if booking is None:
            will_send, reason = False, "Booking deleted"
        elif not is_active(booking.status):
            will_send, reason = False, f"Booking is {booking.status}"
        else:
            will_send, reason = True, ""

        reminders.append({
            "job_id": job.id,
            "label": label,
            "send_at": job.next_run_time.astimezone(IST).isoformat() if job.next_run_time else None,
            "booking_id": booking_id,
            "customer_name": (booking.celebrant_name if booking and booking.celebrant_name else (customer.name if customer else booking_data.get("customer_name"))),
            "phone_number": customer.phone_number if customer else booking_data.get("phone_number"),
            "event_date": str(booking.event_date) if booking else booking_data.get("event_date"),
            "time_slot": booking.event_time if booking else booking_data.get("time_slot"),
            "status": booking.status if booking else None,
            "will_send": will_send,
            "skip_reason": reason,
        })

    # descending: latest send time first
    reminders.sort(key=lambda r: r["send_at"] or "", reverse=True)

    daily = [
        {"name": "Morning digest", "description": "Today's bookings, sent every day at 8:30 AM",
         "send_at": _next_daily(8, 30).isoformat()},
        {"name": "Anniversary reminders", "description": "Customers who celebrated a year ago, checked every day at 9:00 AM",
         "send_at": _next_daily(9, 0).isoformat()},
    ]
    return {"reminders": reminders, "daily": daily}
