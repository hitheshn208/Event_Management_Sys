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

## Architecture (Layers)

```
routes/         URL -> controller method (and auth guard / upload middleware)
controllers/    HTTP adapters: read the request, call a service, shape the JSON
services/       Business logic, one facade per area (auth, events, registrations)
domain/         Objects with behaviour: users, events, registrations
repositories/   All SQL. One class per table group, transaction-aware
core/           Database pool, error types, password hashing, auth tokens
```

Each layer only depends on the layer below it. `container.js` creates every
object once and passes collaborators in through constructors.

Other folders:
- `frontend/`: React app (Vite + React Router), talks to `/api/*`
- `migrations/`: SQL schema and the migration runner
- `public/uploads/`: uploaded event banners, served at `/uploads/*`

## Design patterns

| Pattern | Kind | Where | Why |
|---|---|---|---|
| Singleton | Creational | `core/Database.js` | One connection pool shared by every repository, with a `transaction()` helper |
| Factory Method | Creational | `domain/events/EventFactory.js`, `Event.createRegistrationProcess()` | Builds `IndividualEvent` / `TeamEvent` from a DB row or form; each event type creates its own registration process |
| Facade | Structural | `services/EventService.js`, `services/RegistrationService.js` | Controllers call one method instead of coordinating five repositories |
| Template Method | Behavioral | `domain/registration/RegistrationProcess.js` | Fixed registration steps; `IndividualRegistrationProcess` and `TeamRegistrationProcess` override only the team-name and save steps |

Class hierarchies: `User` -> `Student`, `Organization`; `Event` -> `IndividualEvent`, `TeamEvent`;
`RegistrationProcess` -> `IndividualRegistrationProcess`, `TeamRegistrationProcess`; `AppError` -> 5 HTTP error types.

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
