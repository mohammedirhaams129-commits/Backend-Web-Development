# LU 54 — Authorization & RBAC

## What you are building
Authentication is already done. Add the authorization layer: a `requireRole` factory middleware, role gates on privileged routes, and ownership checks on post routes to close the IDOR (Broken Object Level Authorization).

The request pipeline is:
1. `requireAuth` verifies the token and sets `req.user = { id, role }`.
2. `requireRole(...roles)` allows or blocks by role.
3. Resource routes confirm the caller owns the post or is a moderator/admin.

Authentication failures are **401**; permission failures are **403**.

## Roles and routes
- `u-A`, `u-B`: member
- `u-mod`: moderator
- `u-admin`: admin

| Route | Rule |
|---|---|
| `GET /posts` | Any authenticated user |
| `POST /posts` | Any authenticated user; caller becomes author |
| `PATCH /posts/:id` | Owner or moderator/admin; 404 if missing |
| `DELETE /posts/:id` | Owner or moderator/admin; 404 if missing |
| `POST /posts/:id/hide` | Moderator or admin |
| `DELETE /users/:id` | Admin only |

## Setup
1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Run `npm test` (or `npm start` to start the server on port 3000).

## Implementation
- Implement `src/middleware/requireRole.js` as a factory returning middleware. Return 401 with `UNAUTHENTICATED` if `req.user` is missing; return 403 with `FORBIDDEN` if `req.user.role` is not in the allowed roles; otherwise call `next()`.
- Gate `DELETE /users/:id` with `requireRole('admin')`.
- Gate `POST /posts/:id/hide` with `requireRole('moderator', 'admin')`.
- For PATCH and DELETE post routes, check existence first (404), then allow only the owner or moderator/admin (otherwise 403).

Do not modify `requireAuth.js`. Read role and identity only from the verified `req.user`, never from the request body.

## Why test 2 returns 403
Test 2 sends a request from member B to edit member A's post. The caller is authenticated, but is neither the post owner nor a privileged role. The ownership check in `loadOwnedOrPrivileged` therefore returns `403 FORBIDDEN` before the update runs. This closes the IDOR that previously allowed any authenticated member to edit another member's post.

## Submission
Run `npm test`, commit your work on a feature branch, push it, and open a PR against your own repository's `main` branch.
