# Healthwithherbal

The storefront and API are maintained as separate apps:

- `frontend/` — Next.js 15 storefront.
- `backend/` — Express 4 API with MongoDB/Mongoose.

## Start the backend

Open a terminal in `backend/`, ensure MongoDB is running, then run:

```powershell
npm install
npm run seed
npm run dev
```

## Start the frontend

Open another terminal in `frontend/`, then run:

```powershell
npm install
npm run dev
```
