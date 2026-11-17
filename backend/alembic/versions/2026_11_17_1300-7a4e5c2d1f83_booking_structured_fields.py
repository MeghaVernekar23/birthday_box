"""structured booking fields: package_price, duration, referral, message, staff flag

Revision ID: 7a4e5c2d1f83
Revises: 3c1d2a7b9e40
Create Date: 2026-11-17 13:00:00

Until now the public booking form stored duration, referral source, add-ons,
extra guests, dining hall and the customer's message only as free text inside
bookings.notes. This adds real columns and backfills them from that text for
existing rows. The notes text itself is left untouched.
"""
import json
import re
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '7a4e5c2d1f83'
down_revision: Union[str, Sequence[str], None] = '3c1d2a7b9e40'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _segment(notes: str, key: str):
    for part in notes.split(" | "):
        if part.startswith(key):
            return part[len(key):].strip() or None
    return None


def _items_sum(raw) -> float:
    if not raw:
        return 0.0
    try:
        items = json.loads(raw) if isinstance(raw, str) else raw
        return sum(float(i.get("price") or 0) for i in items or [])
    except (ValueError, TypeError, AttributeError):
        return 0.0


def upgrade() -> None:
    with op.batch_alter_table('bookings') as batch_op:
        batch_op.add_column(sa.Column('package_price', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('duration', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('referral_source', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('customer_message', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('booked_by_staff', sa.Integer(), server_default='0', nullable=False))

    conn = op.get_bind()
    rows = conn.execute(sa.text(
        "SELECT b.booking_id, b.notes, b.payment_total, b.additional_items, p.price "
        "FROM bookings b LEFT JOIN packages p ON p.package_id = b.package_id"
    )).fetchall()

    for booking_id, notes, payment_total, additional_items, list_price in rows:
        notes = notes or ""
        duration = _segment(notes, "Time slot:")
        referral = _segment(notes, "Heard from:")
        staff = 1 if "BOOKED BY STAFF" in notes else 0
        message = None
        m = re.search(r"Message:\s*(.*?)(?:\s\|\sBOOKED BY STAFF.*)?$", notes)
        if m:
            message = m.group(1).strip() or None

        # Keep each existing booking's total stable: whatever isn't an itemised
        # extra is attributed to the package.
        total = float(payment_total or 0)
        if total > 0:
            package_price = max(total - _items_sum(additional_items), 0.0)
        else:
            package_price = float(list_price) if list_price is not None else None

        conn.execute(
            sa.text(
                "UPDATE bookings SET package_price=:pp, duration=:d, referral_source=:r, "
                "customer_message=:m, booked_by_staff=:s WHERE booking_id=:id"
            ),
            {"pp": package_price, "d": duration, "r": referral, "m": message, "s": staff, "id": booking_id},
        )


def downgrade() -> None:
    with op.batch_alter_table('bookings') as batch_op:
        batch_op.drop_column('booked_by_staff')
        batch_op.drop_column('customer_message')
        batch_op.drop_column('referral_source')
        batch_op.drop_column('duration')
        batch_op.drop_column('package_price')
