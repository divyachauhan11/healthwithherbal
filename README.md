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

The backend `.env` contains the local connection settings. Use `.env.example` as a template for another machine or MongoDB Atlas deployment.

## Start the frontend

Open another terminal in `frontend/`, then run:

```powershell
npm install
npm run dev
```

The frontend API URL is configured in `frontend/.env.local` (template: `.env.local.example`). The defaults use `http://localhost:3000` for Next.js and `http://localhost:4000` for Express.