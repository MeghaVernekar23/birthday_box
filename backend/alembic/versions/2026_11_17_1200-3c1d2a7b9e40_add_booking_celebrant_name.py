"""add celebrant_name to bookings

Revision ID: 3c1d2a7b9e40
Revises: 8ef65f010fbf
Create Date: 2026-11-17 12:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3c1d2a7b9e40'
down_revision: Union[str, Sequence[str], None] = '8ef65f010fbf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('bookings', sa.Column('celebrant_name', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('bookings') as batch_op:
        batch_op.drop_column('celebrant_name')
