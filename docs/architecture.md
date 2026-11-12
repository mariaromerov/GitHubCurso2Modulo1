# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep the UI in React/Vite with one shared API client that builds fetch URLs and handles the base path; render each capability as its own route/page and show loading, empty, success, and accessible error states without bypassing the shared client.
- Logic tier decision: Keep all endpoint behavior in Express routes plus dedicated service functions under `octofit-tracker/backend/src`; validate request data in the API layer and return deliberate 4xx responses instead of leaking Mongo/Mongoose cast errors or 500s.
- Data tier decision: Define Mongoose schemas for users, teams, activities, and workouts, then seed stable demo data with upserts so repeated runs stay idempotent and existing demo records are reconciled without clearing unrelated user data.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`; verify both IDs resolve to existing records; store the linked `user` and `team` references plus computed `points` and `occurredAt` values; list all activities in a consistent response object.
- Team management approach: Require a `name` and `mascot` on create, default `members` to `[]`, and keep member IDs in the team record while exposing them through the list response so UI and leaderboard logic can consume a predictable shape.
- Leaderboard approach: Aggregate activity points by team, sort descending by total points, and assign a 1-based rank in the output so scores are ordered highest-first with `teamName`, `totalPoints`, and `rank`.
- Workout suggestions approach: Match the requested email to a seeded user, choose the workout focus based on that user’s goal or recent activity pattern, and include a human-readable `reason` on the first suggestion while returning a deliberate 4xx for unknown emails.

## Test plan

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — This validates the Mongoose contracts and idempotent seed script. If it fails, the schema definitions or seed logic are not aligned with the required data model.
- API command: `npm run test:api --prefix octofit-tracker/backend` — This validates the `/api/*` behavior and error handling. If it fails, the routes or service layer are not enforcing the contract, validation rules, or leaderboard/workout logic correctly.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — This validates the React pages and accessibility states. If it fails, the UI is not handling loading, empty, success, or API-error states as required.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — This checks TypeScript compilation and backend wiring. If it fails, the server code or models do not compile or are misconfigured.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — This checks the Vite/React bundle and TS compilation. If it fails, the presentation tier has a type or bundling issue that must be fixed before shipping the UI.
- TDD loop: Run the smallest failing tier test first, fix that contract, and then move to the next tier so the app stays separated by responsibility and the root cause is clear at each step.
