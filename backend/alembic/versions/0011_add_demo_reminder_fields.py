"""add demo reminder fields to appointments

Revision ID: 0011_add_demo_reminder_fields
Revises: 0010_add_appointment_confirmation_statuses
Create Date: 2026-01-10 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0011_add_demo_reminder_fields"
down_revision = "0010_add_appointment_confirmation_statuses"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "appointments",
        sa.Column(
            "reminder_email_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "appointments",
        sa.Column(
            "reminder_sms_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "appointments",
        sa.Column(
            "reminder_email_minutes_before",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("1440"),
        ),
    )
    op.add_column(
        "appointments",
        sa.Column(
            "reminder_sms_minutes_before",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("120"),
        ),
    )
    op.add_column(
        "appointments",
        sa.Column("reminder_next_run_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("appointments", "reminder_next_run_at")
    op.drop_column("appointments", "reminder_sms_minutes_before")
    op.drop_column("appointments", "reminder_email_minutes_before")
    op.drop_column("appointments", "reminder_sms_enabled")
    op.drop_column("appointments", "reminder_email_enabled")
