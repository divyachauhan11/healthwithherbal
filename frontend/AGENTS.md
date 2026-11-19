# AGENTS.md: HealthWithHerbal

Stack: Next.js 15 / React 19 (frontend, JS/JSX), Node.js + Express 4 +
Mongoose 8 + Zod (backend, CommonJS), MongoDB, Cloudinary, Brevo.

## Shared code locations (reuse BEFORE writing new code)

Backend:

- backend/src/utils/ generic helpers
- backend/src/middleware/ asyncHandler, errorHandler, auth/session, validate
- backend/src/services/ brevoService, cloudinary, and business logic
- backend/src/config.js single source for env/config/constants
  Frontend:
- frontend/src/lib/api-client.js the ONE HTTP client (api.js and
  admin-api.js should become thin wrappers over it)
- frontend/src/hooks/ shared hooks
- frontend/src/components/shared/ primitives.jsx, icons.jsx
- frontend/src/components/admin/global/ and tables/ for admin UI
- frontend/src/components/pages/modals/ for storefront modals

## Rules

- Never duplicate logic. If the same logic appears in 2+ places, extract it.
- Utilities are generic, single-purpose, documented with JSDoc.
- Do not change API routes, response shapes, DB schemas, or UI appearance.
- Do not add dependencies without asking. Prefer removing unused ones.
- Keep backend CommonJS and frontend JS/JSX. Do not convert to TypeScript.
- Follow the existing file naming already used in each folder.
- Never read, print, or commit .env / .env.local contents.
- Do not touch backend/uploads or backend/data.

## Verification (after every change set)

- Frontend: npm run lint and npm run build (in /frontend)
- Backend: node --check on changed files, and start with npm run dev
  to confirm the server boots
- Report any failing command honestly. Never hide errors.
