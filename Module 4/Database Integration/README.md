# Database Integration

The API keeps its repository contract while persisting posts in PostgreSQL through Prisma. Prisma access stays in the repository layer.

## Requirements

- Node.js 18+
- PostgreSQL
- A database created for this project

## Setup

1. Install dependencies: `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your own local PostgreSQL database. Do not commit `.env`.
3. Apply the committed migration: `npm run prisma:deploy`.
4. Generate the Prisma Client: `npm run prisma:generate` (also run automatically during install).
5. Add repeatable demonstration records: `npm run db:seed`.
6. Start the API: `npm start`.

## API contract checks

Use `GET /posts`, `GET /posts/:id`, `POST /posts`, `PATCH /posts/:id`, and `DELETE /posts/:id`. A missing record still returns the existing 404 response; delete success remains 204. Constraint errors return safe application messages rather than database details.

## Migrations and reset safety

Use `npm run prisma:migrate -- --name descriptive_change` for a new development migration, then commit the new migration directory. Use `npm run prisma:deploy` in an environment where migrations should only be applied. The seed uses upserts, so it can be run repeatedly without duplicating its demonstration records.

Do not run destructive database reset commands against a database containing data you need. For a disposable local test database only, create a separate database and point `DATABASE_URL` at it before testing reset behavior.
