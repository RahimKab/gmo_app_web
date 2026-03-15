# GMO Detection Frontend

React + TypeScript + Vite frontend configured for Django backend integration.

## Run the app

```bash
npm install
npm run dev
```

## Backend link configuration

1. Copy `.env.example` to `.env`.
2. Set values for your backend.

```env
VITE_API_BASE_URL=/api
VITE_DJANGO_DEV_ORIGIN=http://127.0.0.1:8000
VITE_HEALTHCHECK_PATH=/health/
VITE_LOGIN_PATH=/auth/login/
VITE_REGISTER_PATH=/auth/register/
```

### Variable meanings

- `VITE_API_BASE_URL`: Base URL used by frontend API requests.
- `VITE_DJANGO_DEV_ORIGIN`: Django server origin used by Vite proxy in development.
- `VITE_HEALTHCHECK_PATH`: Endpoint path used by the home page backend status check.
- `VITE_LOGIN_PATH`: Endpoint path used by the login page POST request.
- `VITE_REGISTER_PATH`: Endpoint path used by the registration page POST request.

## How requests flow in development

- Frontend calls `${VITE_API_BASE_URL}/...` (default `/api/...`).
- Vite proxies `/api` to `VITE_DJANGO_DEV_ORIGIN`.
- Keep Django running locally (for example on `127.0.0.1:8000`).

## Django notes

- If using session auth or CSRF protection, ensure Django CORS and CSRF trusted origins include your Vite dev origin.
- Keep endpoint responses as JSON for the frontend API client.
