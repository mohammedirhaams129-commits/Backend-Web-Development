# Session Authentication API

Express + Prisma API implementing signed, HttpOnly cookie authentication with a server-side session mapping.

## Requirements

Node.js 18+ and npm. SQLite is configured for quick local learning; the user table is accessed only through repository functions.

## Setup and seed

```bash
cp .env.example .env
```

Set `COOKIE_SECRET` in `.env` to a unique random value of at least 32 characters. Keep `COOKIE_SECURE=false` for local HTTP only. For production, set `COOKIE_SECURE=true` and serve the API over HTTPS. Never commit `.env`.

```bash
npm install
npm run setup
npm run dev
```

The seed creates `sam@example.com` with password `SessionDemo!48`. This is a local demo credential only.

## Endpoints

- `POST /auth/login` — JSON body `{"email":"sam@example.com","password":"SessionDemo!48"}`. Returns safe user fields and sets signed `sid`.
- `GET /auth/me` — requires the valid cookie; returns the authenticated safe user.
- `POST /auth/logout` — destroys the server session and clears the cookie; returns `204`, including repeated logout requests.

Cookie flags: `HttpOnly`, `SameSite=Lax`, configured `Secure`, `Path=/`, and a 24-hour `Max-Age`. The signed cookie contains only an opaque random session ID. User identity is recovered from the server-side session store, never trusted directly from cookie contents.

## Verify with curl

Login and save the cookie jar:

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" -d '{"email":"sam@example.com","password":"SessionDemo!48"}' http://localhost:3000/auth/login
```

Use the cookie for identity:

```bash
curl -i -b cookies.txt http://localhost:3000/auth/me
```

Without a cookie, expect 401:

```bash
curl -i http://localhost:3000/auth/me
```

Logout and clear the cookie jar:

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout
curl -i -b cookies.txt http://localhost:3000/auth/me
```

The final request must return 401. Altering the signed cookie also returns 401. With `COOKIE_SECURE=true`, the response includes `Secure`; browsers/clients send that cookie only over HTTPS.

## Session storage warning

The included in-memory Map is for learning and local execution only. It loses sessions on restart and does not work across multiple server instances. Production must use a shared store with TTL/expiration, such as Redis, and appropriate operational security controls.