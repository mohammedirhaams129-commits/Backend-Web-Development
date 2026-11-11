# Authentication Fundamentals

Express and Prisma API with bcryptjs-based registration and login.

## Setup

Requires Node.js 18+ and npm.

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm start
```

The local SQLite database is created at `prisma/dev.db`. The `.env` file and database are ignored by Git. Set `BCRYPT_COST` to a bcrypt work factor from 4 through 31 (default: 12).

## Endpoints

### POST /auth/register

Request:

```json
{ "name": "Sam", "email": "sam@example.com", "password": "correct horse battery staple" }
```

Creates an account after validating all fields and hashing the password asynchronously. Email addresses are trimmed and lowercased. Returns HTTP 201 with only `id`, `name`, and `email`. A duplicate normalized email returns HTTP 409.

### POST /auth/login

Request:

```json
{ "email": "sam@example.com", "password": "correct horse battery staple" }
```

Checks the normalized email and verifies the password with asynchronous `bcrypt.compare`. Valid credentials return HTTP 200 with only `id`, `name`, and `email`. Unknown email and incorrect password both return HTTP 401 with the same `INVALID_CREDENTIALS` response.

Malformed or missing fields return HTTP 400. Unexpected errors return a generic HTTP 500 response. Passwords and hashes are never included in API responses or application logs.

## Quick verification

After starting the API, send the example registration request, then log in with the same credentials. Repeat registration using a differently cased or padded version of the same email to verify the HTTP 409 duplicate response. Try an unknown email and a wrong password and confirm both return the same HTTP 401 JSON body.
