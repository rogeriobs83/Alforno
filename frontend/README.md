# Alforno Frontend

React application served by Vite. It communicates with the backend through `VITE_API_URL`.

## Local setup

1. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend public URL.
2. Run `npm install`.
3. Run `npm run dev`.

The default local backend URL is `http://localhost:3001`.

## Vercel

The root [vercel.json](../vercel.json) builds `frontend/` and rewrites browser routes to the Vite entry point.

1. Import the repository into Vercel and keep the project root at the repository root.
2. Set `VITE_API_URL` to the public Render URL, for example `https://alforno-api.onrender.com`.
3. Deploy, then copy the Vercel production URL into Render's `FRONTEND_ORIGIN`.
4. Redeploy Render after setting `FRONTEND_ORIGIN`, then redeploy Vercel whenever `VITE_API_URL` changes.

`VITE_API_URL` is compiled into the browser bundle, so it must never contain a secret.
