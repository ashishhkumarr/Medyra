# Development Notes

## Architecture overview

- Frontend: React + TypeScript + Vite (glass UI)
- Backend: FastAPI + SQLAlchemy + Alembic
- Database: Postgres (Supabase compatible)
- Local dev: Docker Compose

## Environment variables (high level)

Frontend:

- `VITE_DEMO_MODE`
- `VITE_ENABLE_EMAIL_OTP`
- `VITE_ENABLE_ACCOUNT_DELETION`

Backend:

- `ENABLE_DEMO_RESET`
- `ENABLE_EMAIL_OTP`
- `ENABLE_ACCOUNT_DELETION`

## Common troubleshooting

- CORS errors: verify backend `CORS_ALLOWED_ORIGINS` includes the frontend URL.
- DB connection errors: ensure Postgres container is running, or update `DATABASE_URL`.
- Docker rebuild: `docker compose build --no-cache frontend` or full `docker compose up --build`.
- Demo reset/seed: use demo endpoints when flags are enabled, or wipe volumes with:
  ```bash
  docker compose down -v && docker compose up --build
  ```

## Demo constraints

- Reminders are simulated. No real email/SMS is sent.
- Do not enter real PHI. This is a public demo.
- OTP may be disabled via flags for demo flow.
