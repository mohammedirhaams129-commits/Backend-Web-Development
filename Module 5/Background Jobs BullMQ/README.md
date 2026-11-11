# Background Jobs with BullMQ

Email verification is queued through BullMQ so the HTTP request does not wait for SMTP delivery.

## Requirements

- Node.js 18+
- Redis running locally
- An Ethereal test SMTP account

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the Ethereal credentials from https://ethereal.email/create.

Start Redis in a separate terminal:

```bash
redis-server
```

Run the automated tests:

```bash
npm test
```

Start the API:

```bash
npm start
```

## Endpoints

- `POST /auth/request-verification` with `{ "email": "user@example.com" }` creates a six-digit OTP, stores it for ten minutes, and enqueues an email job.
- `POST /auth/verify-otp` with `{ "email": "user@example.com", "otp": "123456" }` verifies the single-use OTP. Codes expire after ten minutes and allow at most three incorrect attempts.

The email worker retries failed jobs up to three attempts with exponential backoff starting at one second.
