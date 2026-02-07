"""empty message

Revision ID: 144cfc01c3b6
Revises: 2f215d878645
Create Date: 2026-02-05 12:58:13.339874

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '144cfc01c3b6'
down_revision: Union[str, Sequence[str], None] = '2f215d878645'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
