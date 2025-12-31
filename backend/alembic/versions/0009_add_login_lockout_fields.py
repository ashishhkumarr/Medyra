"""add login lockout fields

Revision ID: 0009_add_login_lockout_fields
Revises: 0008_add_audit_logs
Create Date: 2025-02-20 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "0009_add_login_lockout_fields"
down_revision = "0008_add_audit_logs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "failed_login_attempts",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
    )
    op.add_column("users", sa.Column("locked_until", sa.DateTime(), nullable=True))
    op.alter_column("users", "failed_login_attempts", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "locked_until")
    op.drop_column("users", "failed_login_attempts")
