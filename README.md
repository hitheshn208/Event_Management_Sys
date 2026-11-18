# EventHub

An event tracking and publishing system.

A single place for,
    Students to checkout upcoming events organized by clubs.
    Clubs to post about upcoming events.

What we can do?
1. Connect students with event organizers.
2. Provide an interface where students can view any event posted by an organizer.
3. 


Built with an Express + PostgreSQL JSON API and a React (Vite) frontend.

## Project layout

- `app.js`, `routes/`, `controllers/`, `models/`: Express API, served under `/api/*`
- `frontend/`: React app (Vite + React Router)
- `migrations/`: SQL schema and the migration runner
- `public/uploads/`: uploaded event banners, served at `/uploads/*`

## Running locally

```bash
docker compose up -d          # Postgres
cp .env.example .env          # fill in DB_* and JWT_SECRET
npm install
npm run migrate

npm run dev                   # API on http://localhost:3000
npm --prefix frontend install
npm run client                # React on http://localhost:5173 (proxies /api and /uploads to :3000)
```

Open http://localhost:5173.

## Production

```bash
npm run build                 # builds frontend/dist
npm start                     # Express serves the API and the built React app on :3000
```

Authors:
1. [N Hithesh Kumar] (https://github.com/hitheshn208)
2. KaoKsn

Report:
1. N Sathvik

Made with ❤️
