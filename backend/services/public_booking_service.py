"""Public, password-protected booking page that the owner forwards to customers.

Each booking has an unguessable ``public_token`` (the link) and a random 4-digit
``access_pin``. The password is ``access_pin`` + the last 4 digits of the
customer's phone number. Repeated wrong passwords lock the link for a while.
"""
import hmac
import os
import re
import secrets
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from db.models.sqlalchemy_models import Booking, Customer, Packages, CelebrationType

MAX_FAILED_ATTEMPTS = 5
LOCKOUT = timedelta(minutes=15)


def _phone_last4(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")
    return digits[-4:].rjust(4, "0")


def _items_from_notes(notes: str) -> list:
    """Bookings made before add-ons were itemised only have them in the notes text,
    e.g. "Add-ons: Fire Entry - ₹800, Popcorn | Extra guests: 2 x Rs100 | Hall required: ...".
    Show them as lines (prices are already part of the text and of the stored total)."""
    lines = []
    for part in (notes or "").split(" | "):
        part = part.strip()
        if part.startswith("Add-ons:"):
            # split on ", " but not inside amounts like "₹1,500"
            lines += [a.strip() for a in part[len("Add-ons:"):].split(", ") if a.strip()]
        elif part.startswith("Extra guests:"):
            lines.append("Extra guests: " + part[len("Extra guests:"):].strip())
        elif part.startswith("Hall required:"):
            lines.append(part[len("Hall required:"):].strip())
    return [{"description": d, "price": 0} for d in lines]


def ensure_public_access(booking: Booking, db: Session) -> None:
    """Give a booking a token and PIN if it doesn't have them yet."""
    changed = False
    if not booking.public_token:
        booking.public_token = secrets.token_urlsafe(16)
        changed = True
    if not booking.access_pin:
        booking.access_pin = f"{secrets.randbelow(10000):04d}"
        changed = True
    if changed:
        db.commit()
        db.refresh(booking)


def public_link_and_password(booking: Booking, phone_number: str) -> dict:
    """Link + password for the Telegram message."""
    base = os.getenv("FRONTEND_URL", "").rstrip("/")
    return {
        "public_link": f"{base}/booking/{booking.public_token}",
        "public_password": f"{booking.access_pin}{_phone_last4(phone_number)}",
    }


def get_public_booking(token: str, password: str, db: Session) -> dict:
    """Return the customer-facing booking details if the password is right."""
    booking = db.query(Booking).filter(Booking.public_token == token).first() if token else None
    if not booking or not booking.access_pin:
        raise HTTPException(status_code=404, detail="Booking not found.")

    now = datetime.utcnow()
    if booking.access_locked_until and booking.access_locked_until > now:
        raise HTTPException(status_code=429, detail="Too many wrong attempts. Please try again in 15 minutes.")

    customer = db.get(Customer, booking.customer_id)
    expected = f"{booking.access_pin}{_phone_last4(customer.phone_number if customer else '')}"
    if not hmac.compare_digest((password or "").strip(), expected):
        booking.access_failed_attempts = (booking.access_failed_attempts or 0) + 1
        if booking.access_failed_attempts >= MAX_FAILED_ATTEMPTS:
            booking.access_locked_until = now + LOCKOUT
            booking.access_failed_attempts = 0
        db.commit()
        raise HTTPException(status_code=401, detail="Incorrect password.")

    if booking.access_failed_attempts or booking.access_locked_until:
        booking.access_failed_attempts = 0
        booking.access_locked_until = None
        db.commit()

    package = db.get(Packages, booking.package_id)
    celebration = db.get(CelebrationType, booking.celebration_id)
    items = booking.additional_items or _items_from_notes(booking.notes)
    total = float(booking.payment_total or 0)
    paid = float(booking.payment_paid or 0)

    # Only customer-facing fields: no internal notes, staff info or audit data.
    return {
        "booking_id": booking.booking_id,
        "celebrant_name": booking.celebrant_name or (customer.name if customer else ""),
        "phone_last4": _phone_last4(customer.phone_number if customer else ""),
        "event_date": str(booking.event_date) if booking.event_date else None,
        "time_slot": booking.event_time,
        "duration": booking.duration,
        "celebration_name": celebration.celebration_name if celebration else None,
        "package_name": package.package_name if package else None,
        "package_description": package.description if package else None,
        "package_price": booking.package_price,
        "additional_items": [
            {"description": i.get("description", ""), "price": float(i.get("price") or 0)} for i in items
        ],
        "payment_total": total,
        "payment_paid": paid,
        "balance": max(total - paid, 0.0),
        "status": booking.status,
        "customer_message": booking.customer_message,
    }
