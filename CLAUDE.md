# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the server with nodemon (auto-reload)
- `npm start` — start the server with node
- `npm install` — install dependencies

There is no test suite, linter, or build step configured. `request.http` holds ad-hoc HTTP requests for manual testing (VS Code REST Client format).

## Environment

Configuration is loaded from `.env` via `dotenv`. Variables in use: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` (MySQL), `JWT_SECRET`, and `PORT` (defaults to 4000). `.env.example` exists but is currently empty.

## Architecture

Express 5 REST API using ES modules (`"type": "module"` — imports need explicit `.js` extensions), Sequelize on MySQL, Zod for validation, bcryptjs + jsonwebtoken for auth.

Requests flow through a layered structure:

`routes/` → `middleware/` (validation, auth) → `controllers/` → `services/` → `repositories/` → `database/models/`

- **Routes** (`routes/userRoutes.js`) are mounted at `/api/users` in `app.js`. Each route composes `validate(schema)` and/or `authenticate` before the controller.
- **Validation** (`middleware/userValidation.js`) runs a Zod schema from `schemas/` against `req.body` and replaces `req.body` with the parsed data.
- **Controllers** handle HTTP status codes only; they map service errors to responses by matching `error.message` strings (e.g. `"Invalid email or password"` → 401).
- **Services** hold business logic (uniqueness checks, password hashing, JWT signing) and throw plain `Error`s. They return users through `sanitizeUser`, which strips the password.
- **Repositories** are thin wrappers around Sequelize model calls.
- **Models** call `.sync()` at import time, so tables are created automatically when the model is first imported. `app.js` calls `sequelize.authenticate()` before `listen`.

### Auth

- Login returns a JWT (1 day expiry) with payload `{ id, username, email }`.
- `middleware/authMiddleware.js` expects `Authorization: Bearer <token>` and sets `req.user` and `req.token`.
- Logout adds the token to an **in-memory** revocation `Set` (`utils/tokenStore.js`); revocations are lost on restart and not shared across processes.

## Gotchas

- Field naming mismatch: the API/Zod schema uses `userName`, but the DB model column is `username`. The service maps between them, and `sanitizeUser` returns `userName`.
- The controller file is spelled `controllers/userContoller.js` (missing "r"); import paths must match.
- `request.http` targets `http://localhost:3030/register`, which does not match the default port (4000) or the `/api/users` prefix.
