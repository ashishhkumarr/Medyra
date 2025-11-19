# MediTrack

MediTrack is a production-ready patient appointment and medical records system for clinics. It pairs a FastAPI backend with a modern React + TypeScript frontend, supports JWT authentication with RBAC, schedules appointment reminder jobs, and ships with Docker assets plus AWS deployment guidance.

```
              +-----------------------------+
              |         React / Vite        |
              |  Tailwind + React Query     |
              +--------------+--------------+
                             |
                     HTTPS / REST
                             |
        +--------------------v--------------------+
        |               FastAPI API               |
        | Auth • Patients • Appointments • Users  |
        +----------+---------------+--------------+
                   |               |
            APScheduler      SQLAlchemy ORM
                   |               |
             Reminder Jobs     PostgreSQL
```

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, Alembic, PyJWT, APScheduler, PostgreSQL
- **Frontend:** React 18, TypeScript, Vite, React Router, React Query, TailwindCSS
- **Auth:** JWT access tokens stored client-side, bcrypt hashing via Passlib, role enforcement middleware
- **DevOps:** Dockerfiles for frontend/backed, docker-compose (backend + frontend + Postgres + pgAdmin), AWS deployment guide with Nginx reverse proxy

## Project Structure

```
meditrack/
├── backend/
│   ├── app/
│   │   ├── api/v1/...
│   │   ├── core/ (config & security)
│   │   ├── db/ (engine + base)
│   │   ├── models/ (User, Patient, Appointment)
│   │   ├── schemas/
│   │   ├── services/reminder_service.py
│   │   └── tests/
│   ├── alembic/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/ (components, pages, hooks, services, context)
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Environment Variables

**Backend (`backend/.env` based on `.env.example`):**

```
SECRET_KEY=super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=postgresql+psycopg2://meditrack:meditrack@localhost:5432/meditrack
ADMIN_DEFAULT_EMAIL=admin@meditrack.com
ADMIN_DEFAULT_PASSWORD=ChangeMe123!
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-smtp-key
REMINDER_HOURS_BEFORE=24
```

**Frontend (`frontend/.env`):**

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Running Locally

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # adjust values
uvicorn app.main:app --reload --port 8000
```

Database migrations (optional when not relying on `Base.metadata.create_all`):

```bash
alembic upgrade head
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:8000`.

### Automated Tests

Backend `pytest` suite covers authentication, CRUD flows, ORM behavior, and security helpers:

```bash
cd backend
pytest
```

Frontend tests are not bundled (React Query heavy), but TypeScript plus ESLint ensure baseline safety:

```bash
cd frontend
npm run lint
```

## Dockerized Setup

```bash
docker compose up --build
```

Services:

- `backend`: FastAPI on `http://localhost:8000`
- `frontend`: nginx-served React build on `http://localhost:5173`
- `db`: PostgreSQL (user/pass/db = `meditrack`)
- `pgadmin`: available at `http://localhost:5050`

Stop with `docker compose down` (add `-v` to wipe Postgres volume).

## API Summary

| Endpoint | Method | Description | Auth |
| --- | --- | --- | --- |
| `/api/v1/auth/login` | POST | Issue JWT token | Public |
| `/api/v1/auth/register` | POST | Create users (admin only) | Admin |
| `/api/v1/users/me` | GET/PUT | View/update logged-in user | Authenticated |
| `/api/v1/patients/` | GET/POST | List or create patient records | Admin |
| `/api/v1/patients/{id}` | GET/PUT/DELETE | Manage a patient | Admin / Owner |
| `/api/v1/patients/me` | GET | Patient views own record | Patient |
| `/api/v1/appointments/` | GET/POST | Admin manages appointments (patients can request via POST for themselves) | Role based |
| `/api/v1/appointments/my` | GET | Patient-specific schedule | Patient |

All endpoints honor JWT bearer tokens (`Authorization: Bearer <token>`). Passwords use bcrypt hashing and tokens encode `sub` + `role`.

## Reminder Service

`APScheduler` runs hourly to find appointments within `REMINDER_HOURS_BEFORE` (24h by default). When SMTP creds are configured, reminder emails are sent. Without SMTP, reminders are logged so you can test behavior safely.

## Frontend Highlights

- **State & Data:** React Query hooks wrap `/patients`, `/appointments`, `/users` endpoints with caching + invalidation.
- **Auth:** Context stores token + user metadata in `localStorage`, with hydration state to avoid flicker.
- **Routing:** `ProtectedRoute` enforces authentication and role-specific access for admin/patient dashboards.
- **UI:** Tailwind CSS provides responsive cards, forms, and dashboards. Loading + error components centralize UX states.
- **Pages:** Login, Admin Dashboard, Patient Dashboard, Appointment List, Create Appointment, Patient Record Details, Edit Profile, My Appointments, Not Found.

## Default Data / Seeds

On startup the backend auto-creates an admin using `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD`. Use those credentials to bootstrap the system, then register patients/users through the UI or API.

## AWS Deployment Guide

1. **Provision EC2:** Launch Ubuntu 22.04 LTS, open ports 22, 80, 443 in the security group.
2. **Install Docker & Compose:**
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin
   sudo usermod -aG docker ubuntu
   ```
   Reconnect to activate group membership.
3. **Fetch Code:** Clone this repo or `scp` it to `/opt/meditrack`.
4. **Environment:** Populate `backend/.env` and `frontend/.env` with production values (strong `SECRET_KEY`, RDS URL if external Postgres, SMTP creds, etc.).
5. **Reverse Proxy:** Install Nginx to terminate SSL and forward traffic to frontend/backend containers.
   - Configure upstreams pointing at `frontend:80` and `backend:8000`.
   - Example snippet:
     ```
     server {
       listen 80;
       server_name meditrack.example.com;
       location /api/ {
         proxy_pass http://127.0.0.1:8000/api/;
         proxy_set_header Host $host;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
       location / {
         proxy_pass http://127.0.0.1:5173/;
       }
     }
     ```
6. **SSL:** Use Certbot (`sudo snap install --classic certbot`) to issue certificates, then update the Nginx server block to listen on 443 with `ssl_certificate` paths.
7. **Run Containers:** `docker compose up -d --build`. Use `systemd` service or a simple cron to ensure containers restart on reboot (`docker compose restart`).
8. **Database Considerations:** Lock down Postgres to the private subnet, enforce strong passwords, enable regular backups or use AWS RDS for managed storage.

## Screenshots

Add real screenshots to `docs/screenshots/` and reference them below:

- ![Admin Dashboard](docs/screenshots/admin-dashboard.png "Admin dashboard placeholder")
- ![Patient Dashboard](docs/screenshots/patient-dashboard.png "Patient dashboard placeholder")

## Troubleshooting

- **401 errors:** Ensure the client includes `Authorization: Bearer <token>` header. Tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES`.
- **Scheduler not running:** Confirm the backend logs show `APScheduler` started; in Docker ensure container clocks are correct.
- **CORS issues:** `app/main.py` enables permissive CORS; tighten in production by setting `allow_origins`.
- **pgAdmin can't connect:** Use service name `db`, user/pass `meditrack`, port `5432`.

## Next Steps

- Add React component tests with Vitest + React Testing Library.
- Hook up transactional email provider (SES, SendGrid) for production reminders.
- Implement patient self-service appointment requests with approval workflow.

---

MediTrack delivers the full-stack scaffolding—from secure authentication to scheduling automation—to get a clinic operations app into production quickly. Customize modules, extend the schema, or plug in third-party services as needed. Happy shipping!
