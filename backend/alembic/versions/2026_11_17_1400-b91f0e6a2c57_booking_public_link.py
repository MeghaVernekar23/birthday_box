"""public password-protected booking link

Revision ID: b91f0e6a2c57
Revises: 7a4e5c2d1f83
Create Date: 2026-11-17 14:00:00

Adds a random public token + 4-digit PIN to every booking and backfills
existing rows so their links work too.
"""
import secrets
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b91f0e6a2c57'
down_revision: Union[str, Sequence[str], None] = '7a4e5c2d1f83'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('bookings') as batch_op:
        batch_op.add_column(sa.Column('public_token', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('access_pin', sa.String(length=4), nullable=True))
        batch_op.add_column(sa.Column('access_failed_attempts', sa.Integer(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('access_locked_until', sa.DateTime(), nullable=True))
        batch_op.create_index('ix_bookings_public_token', ['public_token'], unique=True)

    conn = op.get_bind()
    for (booking_id,) in conn.execute(sa.text("SELECT booking_id FROM bookings")).fetchall():
        conn.execute(
            sa.text("UPDATE bookings SET public_token=:t, access_pin=:p WHERE booking_id=:id"),
            {"t": secrets.token_urlsafe(16), "p": f"{secrets.randbelow(10000):04d}", "id": booking_id},
        )


def downgrade() -> None:
    with op.batch_alter_table('bookings') as batch_op:
        batch_op.drop_index('ix_bookings_public_token')
        batch_op.drop_column('access_locked_until')
        batch_op.drop_column('access_failed_attempts')
        batch_op.drop_column('access_pin')
        batch_op.drop_column('public_token')
