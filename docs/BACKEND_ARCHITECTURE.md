# CareerBridge backend architecture

## Runtime shape

The backend is an Express 5 application under `server/src`. `server/src/server.js`
creates the HTTP server, verifies shutdown signals, starts the email worker, and delegates
request handling to `createApp` in `server/src/app.js`.

Every API is mounted below `/api/v1`. The application applies middleware in this order:

1. request ID and structured request logging
2. Helmet security headers
3. credentialed CORS for the configured frontend origin
4. response compression
5. cookie parsing
6. session lookup
7. origin and CSRF protection for unsafe methods
8. bounded JSON/form parsing
9. public and role-protected routers
10. not-found and normalized error handling

## Module boundaries

Feature modules live in `server/src/modules`. Most follow the same dependency direction:

```text
route -> validation schema -> controller -> service -> repository -> Prisma
```

- Routes define HTTP method, path, authentication, role, and validation boundaries.
- Zod schemas normalize untrusted params, query strings, and bodies.
- Controllers translate HTTP requests and service results without containing policy.
- Services enforce ownership, lifecycle rules, transactions, notifications, and side effects.
- Repositories contain explicit Prisma selections and persistence operations.
- Presenters convert database records into stable client-facing representations.

Services accept dependency overrides where useful. Unit tests can isolate policy while
integration tests retain the production dependencies and use PostgreSQL.

## Authentication and authorization

Passwords are hashed with Argon2id. Login issues a cryptographically random opaque token;
only its hash is stored in `Session`. The raw value is sent in an `HttpOnly`, `SameSite=Lax`
cookie. A second readable cookie supplies the double-submit CSRF token required in the
`x-csrf-token` header for authenticated mutations.

`sessionAuth` resolves active, unexpired sessions and attaches only the authenticated
context needed by downstream handlers. `requireAuth` and `requireRole` protect routes,
but services and repository queries independently enforce record ownership:

- applicants can read only their own profiles, applications, and résumés;
- recruiters are scoped through `CompanyMember` to one company workspace;
- recruiter résumé access exists only through an application to their company;
- administrator APIs require the `ADMIN` role and write audit records.

Suspension blocks login and existing session use. Administrative suspension also revokes
all sessions. Password reset consumes a hashed, expiring one-time token and revokes all
sessions in the same transaction.

## Business workflows

### Applicant

The profile aggregate includes base information, preferences, education, experience,
projects, certifications, normalized skills, and résumé metadata. Repeated records use
separate CRUD endpoints. The skills endpoint replaces the desired normalized set
idempotently. Profile completion is calculated on the server from stored evidence.

Applications are created transactionally after checking that the job is published,
moderation-cleared, unexpired, and owned résumé belongs to the applicant. Required
screening answers are validated against the job snapshot. Creation also writes initial
history, a match explanation, notifications, and email-outbox messages. The unique
`(applicantId, jobId)` constraint provides the final duplicate guard.

### Recruiter

A recruiter is scoped to a company membership. Jobs progress through draft, published,
closed, reopened, and archived states. Publication requires a verified company and a
complete job. Editing a published job returns it to pending moderation. Candidate status
transitions use an explicit state machine, append immutable history, and notify the
applicant. Recruiter notes are private and author-scoped for deletion.

### Administrator

Administrators verify companies, moderate jobs, and suspend/reactivate users. Each state
change uses optimistic state conditions, a transaction, an `AuditLog`, and appropriate
notifications. An administrator cannot suspend their own account.

## Résumé pipeline

Multer keeps one bounded upload in memory. Validation checks size, extension, declared
MIME type, and detected file signature before bytes are written. The development storage
adapter writes UUID-based keys below `server/storage/uploads`; callers never supply a
filesystem path. PDF or DOCX text extraction is followed by conservative structured
suggestions. Suggestions are presented for applicant review and do not silently change
the profile.

Résumé records are soft-deleted so submitted applications retain their historical file
reference. Applicant access excludes deleted records. Recruiter content access is based
on the application/company relationship.

## Matching

The structured match service calculates deterministic bounded components for required
skills, preferred skills, experience, and declared work/location preferences. It returns
matched and missing skills plus human-readable evidence. It does not use names, age,
gender, photographs, contact details, or other protected attributes.

When enabled, the local Transformers embedding provider stores pgvector job and résumé
embeddings. Semantic similarity is an optional component of the hybrid result. Model or
network failure falls back to the structured score; it never prevents applying.
Background work is scheduled with error isolation, and model warmup is available as a
separate command.

## Notifications and email

In-app notifications are durable PostgreSQL records with per-user read state. Email uses
an outbox in the same business transaction as the triggering event. Payloads are encrypted
with AES-256-GCM before storage. The bounded worker claims pending rows, sends with
Nodemailer, records success, and schedules capped retries on failure. Mailpit provides the
development SMTP server and inbox.

## Errors and observability

Expected failures use stable `AppError` codes, HTTP status, safe messages, and optional
field errors. Unexpected failures return a generic response and are logged with the
request ID. Passwords, raw session/reset tokens, cookies, and full résumé contents are not
included in application log fields.

## Extension points

- Replace local résumé storage with an object-storage adapter while retaining storage keys.
- Run the email worker as a separate process if throughput grows.
- Replace the local embedding provider through the existing injectable boundary.
- Add a queue for heavy extraction/embedding tasks without changing public API contracts.
- Move development secrets to a managed secret store for production.
