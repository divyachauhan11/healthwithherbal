# Healthwithherbal

New to the codebase? Start with [CODEBASE_GUIDE.md](CODEBASE_GUIDE.md): architecture,
folder layout, the API layer, conventions and how-to recipes.

The storefront and API are maintained as separate apps:

- `frontend/` — Next.js 15 storefront.
- `backend/` — Express 4 API with MongoDB/Mongoose.

## Start the backend

Open a terminal in `backend/`, ensure MongoDB is running, then run:

```powershell
npm install
npm run db:init   # creates collections and indexes (see CODEBASE_GUIDE.md §3 for .env)
npm run dev
```

## Start the frontend

Open another terminal in `frontend/`, then run:

```powershell
npm install
npm run dev
```
