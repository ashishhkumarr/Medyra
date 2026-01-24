# Deployment

This guide covers a simple production-like deployment using:

- Frontend: Vercel
- Backend: Google Cloud Run (container)
- Database: Supabase Postgres

No secrets are included. Use your own environment values.

## Required environment variables

### Frontend (Vercel)

- `VITE_API_BASE_URL` (example: `https://api.your-domain.com/api/v1`)
- `VITE_DEMO_MODE` (`true` or `false`)
- `VITE_ENABLE_EMAIL_OTP` (`true` or `false`)
- `VITE_ENABLE_ACCOUNT_DELETION` (`true` or `false`)

### Backend (Cloud Run)

- `DATABASE_URL`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `ENV` (`production`)
- `CORS_ALLOWED_ORIGINS` (comma-separated, include your Vercel URL)

Optional email flags:

- `EMAIL_ENABLED`
- `EMAIL_PROVIDER` (`dev`, `resend`, `disabled`)
- `EMAIL_FROM`
- `RESEND_API_KEY`

Demo flags (recommended false in prod):

- `ENABLE_DEMO_RESET`
- `ENABLE_EMAIL_OTP`
- `ENABLE_ACCOUNT_DELETION`

## Vercel (frontend)

1) Connect the repo to Vercel.
2) Set **Root Directory** to `frontend`.
3) Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4) Add environment variables listed above.
5) Deploy.

## Cloud Run (backend)

Build and deploy the backend container from the repo root:

```bash
# Build container
cd backend
docker build -t medyra-backend .

# Tag and push to Artifact Registry (example)
docker tag medyra-backend REGION-docker.pkg.dev/PROJECT/REPO/medyra-backend:latest
docker push REGION-docker.pkg.dev/PROJECT/REPO/medyra-backend:latest

# Deploy to Cloud Run
gcloud run deploy medyra-backend \
  --image REGION-docker.pkg.dev/PROJECT/REPO/medyra-backend:latest \
  --region REGION \
  --allow-unauthenticated \
  --concurrency 80 \
  --min-instances 0 \
  --set-env-vars \
    DATABASE_URL=...,SECRET_KEY=...,ACCESS_TOKEN_EXPIRE_MINUTES=60,ENV=production,CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

Notes:
- `--allow-unauthenticated` is required for public frontend access.
- Use your Vercel domain in `CORS_ALLOWED_ORIGINS`.

## CORS configuration

Set `CORS_ALLOWED_ORIGINS` to the exact frontend origin:

```
CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

If you use a custom domain, include that origin instead.

## Database migrations

Run migrations after deploying backend code that changes schema.

Option A (recommended for production):

```bash
cd backend
alembic upgrade head
```

Option B (one-off container job):
- Run a temporary Cloud Run job with the same image and env vars, then execute `alembic upgrade head`.

## Smoke test checklist

- Frontend loads and can reach backend
- Login/signup works
- Dashboard analytics loads
- Patients list loads and create flow works
- Appointments list loads and create flow works
- Audit log loads
- CORS errors are not present in browser console
