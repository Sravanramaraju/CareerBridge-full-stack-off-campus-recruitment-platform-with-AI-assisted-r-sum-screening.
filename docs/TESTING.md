# CareerBridge testing guide

## Test layers

CareerBridge separates fast isolated tests from real persistence tests.

| Layer                  | Command                    | Scope                                                                     |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------- |
| Frontend               | `npm test`                 | Components, pages, hooks, service adapters, routing, accessibility states |
| Backend unit/route     | `npm run test:server`      | Schemas, services, repositories, presenters, middleware, route boundaries |
| PostgreSQL integration | `npm run test:integration` | Real Prisma queries, transactions, cookies, ownership, workflows, storage |
| Complete               | `npm run test:all`         | Every automated suite                                                     |
| Release verification   | `npm run verify`           | Frontend lint/build plus all automated suites                             |

## Prerequisites for integration tests

1. Start Docker Desktop.
2. Copy `server/.env.example` to `server/.env`.
3. Run `npm run db:up`.
4. Run `npm run test:integration`.

The integration command creates `careerbridge_test` if necessary and applies all committed
migrations before Vitest starts. The database is intentionally separate from development.

## Database safety

`server/tests/integration/database.js` refuses to reset data unless:

- `DATABASE_URL` exactly equals `DATABASE_URL_TEST`; and
- the selected database name ends in `_test`.

The reset truncates application tables with cascade but preserves `_prisma_migrations`.
Do not weaken these checks or set the test URL to development/production.

## Current critical integration coverage

The PostgreSQL suite verifies:

- applicant and recruiter signup with relational profile/company creation;
- cookie session restoration, CSRF enforcement, logout, invalid login, and suspension;
- encrypted password-reset outbox payload, expiry, one-time use, password replacement,
  and complete session revocation;
- application creation, duplicate prevention, unavailable jobs, foreign résumés, initial
  history, notifications, bounded match persistence, and required ownership;
- recruiter/applicant status synchronization and illegal transition rejection;
- cross-company and cross-applicant isolation plus private recruiter-note non-disclosure;
- admin company/job/user moderation, audit evidence, notifications, email queueing,
  suspension revocation, role denial, and self-suspension rejection;
- résumé signature validation, local storage, owner streaming, application-scoped recruiter
  access, unrelated recruiter/applicant denial, and soft deletion;
- recruiter job draft relations, publication completeness, lifecycle transitions, and
  cross-company read/update denial.

Embeddings are disabled in integration tests so the suite never downloads a model or
depends on external network access. Unit tests inject semantic providers to cover success,
bounded scoring, and structured fallback behavior.

## Test conventions

- Keep frontend HTTP behavior mocked at the service boundary for focused UI tests.
- Keep business policy in service tests with explicit dependency doubles.
- Add a PostgreSQL integration test for every critical cross-module transaction or
  ownership boundary.
- Use fictional tiny résumé fixtures only; never commit a real person's résumé.
- Do not assert private implementation details when a public response or database invariant
  expresses the intended behavior.
- Every test must be deterministic and must not require the embedding model.
- Preserve meaningful error-code assertions for failure paths.

## Manual smoke test

With `npm run db:up`, `npm run db:seed`, and `npm run dev:full` running:

### Public

1. Open `/`, `/jobs`, and `/companies`.
2. Search by text/location and combine filters.
3. Open job and company detail pages.
4. Confirm only verified, cleared, active roles appear.

### Applicant

1. Log in as `applicant@careerbridge.demo` / `demo1234`.
2. Confirm the dashboard, profile completion, saved jobs, applications, and notifications.
3. Add/edit/remove a repeated profile record and replace the skills set.
4. Upload a fictional PDF/DOCX, review suggestions, set primary, open, then soft-delete it.
5. Save/remove a job, inspect match evidence, apply, and confirm the timeline.

### Recruiter

1. Log in as `recruiter@careerbridge.demo` / `demo1234`.
2. Create a complete draft with skills and required/optional screening questions.
3. Publish, inspect, edit, close, and reopen appropriate jobs.
4. Open the candidate pipeline, update a legal status, add/delete a private note, and open
   an authorized résumé.

### Administrator

1. Log in as `admin@careerbridge.demo` / `demo1234`.
2. Verify/change a company, moderate a job, and suspend/reactivate a non-admin user.
3. Confirm dashboard counts and list filters update from server state.

### Email

1. Request password recovery for a demo user.
2. Open Mailpit at `http://localhost:8025` and confirm receipt.
3. Follow the local reset URL, set a new password, and verify old sessions no longer work.

## Debugging

- `docker compose ps` confirms PostgreSQL/Mailpit health.
- `docker compose logs --tail 100 postgres mailpit` shows infrastructure errors.
- `npm run db:deploy` reports migration drift/pending migrations.
- `http://localhost:4000/api/v1/health` confirms API database connectivity.
- `http://localhost:8025` displays delivered local emails.
- Port `5433` is intentional and avoids conflict with native Windows PostgreSQL on `5432`.
