# CareerBridge

CareerBridge is a full-stack off-campus recruitment portal for students, graduates,
recruiters, and platform administrators. It combines a React application with an
Express API, PostgreSQL persistence, secure cookie sessions, résumé processing,
explainable job matching, moderation workflows, notifications, and local email delivery.

The repository is a portfolio demonstration. Seeded companies, people, jobs, résumés,
and applications are fictional.

## Product areas

- Public job search, filtering, company profiles, and career resources
- Applicant profile, repeated education/experience/project/certification records,
  idempotent skills, résumé review, saved jobs, applications, and status timelines
- Recruiter company workspace, job lifecycle, screening questions, candidate pipeline,
  status transitions, private notes, and authorized résumé access
- Administrator dashboards for company verification, job moderation, user suspension,
  session revocation, and audit records
- Structured and optional semantic matching with transparent evidence and bounded scores
- In-app notifications plus an encrypted PostgreSQL email outbox delivered through SMTP

## Technology

- React 19, React Router, TanStack Query, Zustand, React Hook Form, Zod, and Tailwind CSS
- Node.js 22+, Express 5, Prisma 7, PostgreSQL 17, and pgvector
- Argon2id password hashing, opaque hashed sessions, double-submit CSRF protection,
  Helmet, strict CORS, request limits, and rate limiting
- Vitest, Testing Library, Supertest, and a dedicated PostgreSQL integration database
- Docker Compose for PostgreSQL and Mailpit

## Prerequisites

- Node.js 22.13 or newer
- npm
- Docker Desktop with the Linux engine running

CareerBridge maps its Docker PostgreSQL service to host port `5433` so it can coexist
with a native Windows PostgreSQL installation on the default port `5432`.

## First-time setup

From `D:\Projects\Career Bridge Full Stack App`:

```powershell
npm install
npm --prefix server install
Copy-Item server/.env.example server/.env
npm run db:up
npm run db:deploy
npm run db:seed
npm run dev:full
```

Open:

- Frontend: `http://localhost:5173`
- API health: `http://localhost:4000/api/v1/health`
- Mailpit inbox: `http://localhost:8025`

The Vite development server proxies `/api` requests to the API, so browser cookies and
CSRF protection work without client-side cross-origin workarounds.

## Demo accounts

All seeded demo accounts use password `demo1234`.

| Role          | Email                         |
| ------------- | ----------------------------- |
| Applicant     | `applicant@careerbridge.demo` |
| Recruiter     | `recruiter@careerbridge.demo` |
| Administrator | `admin@careerbridge.demo`     |

Passwords are hashed with Argon2id in PostgreSQL. The seed can be rerun safely and does
not overwrite unrelated user-created records.

## Common commands

| Command                    | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `npm run dev`              | Start the React application                    |
| `npm run dev:server`       | Start the API with Node watch mode             |
| `npm run dev:full`         | Start frontend and API together                |
| `npm run db:up`            | Start PostgreSQL and Mailpit                   |
| `npm run db:down`          | Stop Compose services without deleting volumes |
| `npm run db:deploy`        | Apply committed migrations                     |
| `npm run db:migrate`       | Create/apply a development migration           |
| `npm run db:seed`          | Seed the fictional demonstration dataset       |
| `npm run db:test:prepare`  | Create and migrate the isolated test database  |
| `npm run test`             | Run frontend tests                             |
| `npm run test:server`      | Run backend unit and route tests               |
| `npm run test:integration` | Run real PostgreSQL integration tests          |
| `npm run test:all`         | Run every automated test suite                 |
| `npm run verify`           | Lint, build, and run all tests                 |
| `npm run ai:warmup`        | Download/cache the optional embedding model    |

## Environment

Copy `server/.env.example` to `server/.env`. Important variables include:

- `DATABASE_URL` and `DATABASE_URL_TEST`: separate development and test databases
- `CLIENT_ORIGIN`: the allowed browser origin
- session and password-recovery lifetimes and rate limits
- `LOCAL_STORAGE_PATH` and `MAX_RESUME_SIZE_BYTES`
- SMTP/Mailpit connection settings
- `OUTBOX_ENCRYPTION_KEY`: must be replaced with a unique 64-character hex key in production
- `EMBEDDINGS_ENABLED`, `EMBEDDING_MODEL`, and `MODEL_CACHE_DIR`

Never commit `server/.env`, uploaded résumés, model caches, or other runtime data.

## Data and email behavior

PostgreSQL is the source of truth for all mutable business state. The browser stores only
theme preferences; authentication uses `HttpOnly` session cookies and a readable CSRF
cookie paired with the `x-csrf-token` request header.

Résumés are stored under `server/storage/uploads` in development and metadata is stored
in PostgreSQL. Uploaded PDF and DOCX files are validated by extension, MIME type, size,
and detected file signature. Seeded résumés are generated fictional PDFs.

Email is queued in an encrypted outbox. The API process runs a bounded background worker
that sends through Mailpit locally and records retry/sent state in PostgreSQL.

## Matching policy

CareerBridge matching is decision support, not automated hiring. The deterministic score
uses job-relevant skills, experience, education/project evidence, and stated preferences.
An optional local embedding model can add semantic similarity; failures fall back to the
structured score. Protected personal attributes are not used.

## Documentation

- [Frontend architecture](docs/FRONTEND_ARCHITECTURE.md)
- [Backend architecture](docs/BACKEND_ARCHITECTURE.md)
- [Database architecture](docs/DATABASE_ARCHITECTURE.md)
- [API reference](docs/API_REFERENCE.md)
- [Testing guide](docs/TESTING.md)
- [Implementation status](docs/IMPLEMENTATION_STATUS.md)

## Production notes

Before deployment, use a managed PostgreSQL/pgvector instance, HTTPS, a unique outbox
encryption key, durable object storage for résumés, a real SMTP provider, secure backup
and retention policies, centralized logs, and production-specific cookie/CORS settings.
Run `npm run verify` and apply migrations with `npm run db:deploy` during release.
