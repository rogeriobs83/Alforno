# Alforno Backend

Express API and MongoDB integration for the Alforno frontend.

## Setup

1. Copy `.env.example` to `.env` and provide real values for the secrets.
2. Ensure MongoDB is running, then initialize collections with `mongosh < scripts/setup-mongodb.js`.
3. Run `npm install`.
4. Run `npm run dev`.

The server listens on `http://localhost:3001` by default. Set `FRONTEND_ORIGIN` to the frontend URL. For multiple permitted frontend origins, use a comma-separated list.