# Railway Deploy Guide

Deploy this repo to Railway as two services from the same monorepo:

- `backend/` for the API
- `front/` for the web app

## Service Setup

1. Create a Railway project with two services.
2. Set the backend service root directory to `/backend`.
3. Set the frontend service root directory to `/front`.
4. Let Railway build each service from its local `Dockerfile`.

Useful Railway docs:

- https://docs.railway.com/guides/monorepo
- https://docs.railway.com/deploy/dockerfiles
- https://docs.railway.com/reference/healthchecks

## Backend Variables

Required:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_BASE_URL`
- `CORS_ALLOW_ORIGINS`

Optional:

- `REDIS_URL` or `REDIS_ADDR`
- `REDIS_HOST`
- `REDIS_PORT`
- `REQUIRE_EMAIL_VERIFICATION`
- `APP_VERIFY_EMAIL_BASE_URL`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_WINDOW`
- `SESSION_INACTIVITY_TIMEOUT`
- `SESSION_MAX_LIFETIME`
- `SESSION_ACTIVITY_UPDATE_INTERVAL`
- `API_BODY_LIMIT_BYTES`
- `CONTACT_FORM_TO`
- SMTP/email variables used by the mailer

Recommended values:

- `FRONTEND_BASE_URL=https://<your-frontend-domain>`
- `CORS_ALLOW_ORIGINS=https://<your-frontend-domain>`
- `APP_VERIFY_EMAIL_BASE_URL=https://<your-frontend-domain>/verify-email`

## Frontend Variables

Set this before building the frontend service:

- `VITE_API_URL=https://<your-backend-domain>/api`

## Health Check

Configure the backend Railway health check path to:

- `/health`
