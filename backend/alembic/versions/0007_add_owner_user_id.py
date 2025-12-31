"""add owner_user_id to patients and appointments

Revision ID: 0007_add_owner_user_id
Revises: 0006_add_signup_otps
Create Date: 2025-02-20 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "0007_add_owner_user_id"
down_revision = "0006_add_signup_otps"
branch_labels = None
depends_on = None


def _get_primary_user_id(connection) -> int | None:
    result = connection.execute(
        sa.text("SELECT id FROM users ORDER BY created_at ASC, id ASC LIMIT 1")
    ).fetchone()
    return result[0] if result else None


def _backfill_owner(connection, table_name: str, user_id: int) -> None:
    connection.execute(
        sa.text(
            f"UPDATE {table_name} SET owner_user_id = :user_id "
            "WHERE owner_user_id IS NULL"
        ),
        {"user_id": user_id},
    )


def _set_not_null_if_filled(connection, table_name: str) -> None:
    result = connection.execute(
        sa.text(
            f"SELECT COUNT(*) FROM {table_name} WHERE owner_user_id IS NULL"
        )
    ).fetchone()
    if result and result[0] == 0:
        op.alter_column(table_name, "owner_user_id", nullable=False)


def upgrade() -> None:
    op.add_column(
        "patients",
        sa.Column("owner_user_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "appointments",
        sa.Column("owner_user_id", sa.Integer(), nullable=True),
    )
    op.create_index(
        "ix_patients_owner_user_id",
        "patients",
        ["owner_user_id"],
    )
    op.create_index(
        "ix_appointments_owner_user_id",
        "appointments",
        ["owner_user_id"],
    )
    op.create_foreign_key(
        "fk_patients_owner_user_id_users",
        "patients",
        "users",
        ["owner_user_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_appointments_owner_user_id_users",
        "appointments",
        "users",
        ["owner_user_id"],
        ["id"],
    )

    connection = op.get_bind()
    user_id = _get_primary_user_id(connection)
    if user_id is not None:
        _backfill_owner(connection, "patients", user_id)
        _backfill_owner(connection, "appointments", user_id)

    _set_not_null_if_filled(connection, "patients")
    _set_not_null_if_filled(connection, "appointments")


def downgrade() -> None:
    op.drop_constraint(
        "fk_appointments_owner_user_id_users", "appointments", type_="foreignkey"
    )
    op.drop_constraint(
        "fk_patients_owner_user_id_users", "patients", type_="foreignkey"
    )
    op.drop_index("ix_appointments_owner_user_id", table_name="appointments")
    op.drop_index("ix_patients_owner_user_id", table_name="patients")
    op.drop_column("appointments", "owner_user_id")
    op.drop_column("patients", "owner_user_id")
