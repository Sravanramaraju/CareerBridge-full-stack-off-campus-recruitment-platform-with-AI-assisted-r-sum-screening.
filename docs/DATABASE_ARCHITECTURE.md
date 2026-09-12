# CareerBridge database architecture

## Platform

CareerBridge uses PostgreSQL 17 with the pgvector extension. Prisma owns the relational
schema and committed SQL migrations under `server/prisma/migrations`. Docker Compose maps
the development server to `localhost:5433`; `careerbridge` and `careerbridge_test` are
separate databases.

The application uses generated CUID primary keys unless a stable fictional ID is supplied
by the development seed. Timestamps are stored as PostgreSQL timestamps and returned as
ISO values by the API. Salary and experience precision use `Decimal` columns rather than
floating-point storage.

## Domain relationships

```text
User
├── Session, PasswordResetToken, UserPreference, Notification, AuditLog
├── ApplicantProfile
│   ├── ApplicantEducation, ApplicantExperience, ApplicantProject
│   ├── ApplicantCertification, ApplicantSkill -> Skill
│   └── Resume -> ResumeEmbedding
├── RecruiterProfile
└── CompanyMember -> Company
                     └── Job -> JobSkill -> Skill
                              ├── JobScreeningQuestion
                              ├── JobEmbedding
                              └── Application
                                  ├── ApplicationScreeningAnswer
                                  ├── ApplicationStatusHistory
                                  ├── ApplicationMatch
                                  └── RecruiterNote
```

`SavedJob` joins an applicant `User` to a `Job`. `EmailOutbox` is deliberately independent
of `User` so delivery remains auditable even when an account is later removed.

## Identity and security records

### User

Stores normalized unique email, Argon2id hash, display name, role, status, and login/audit
timestamps. Optional one-to-one applicant and recruiter profiles prevent mixing role data.

### Session

Stores only the hash of an opaque browser token, expiry, last-seen time, and minimal agent
metadata. Rows cascade with the user and are indexed by user and expiry.

### PasswordResetToken

Stores a one-time token hash, expiry, use time, and creation time. Raw reset tokens exist
only in the encrypted email payload delivered to the user.

### UserPreference

Stores role-relevant notification choices as one row per user. Defaults are created during
signup and seeding.

## Applicant records

`ApplicantProfile` owns base profile fields and string-array search preferences. Education,
experience, projects, and certifications are repeated entities with explicit display order.
`ApplicantSkill` is a composite-key join to the normalized `Skill` catalog and can retain
proficiency and years of evidence.

`Resume` stores metadata, parsing state, extracted text, reviewed structured suggestions,
and a provider-neutral storage key. Bytes stay outside PostgreSQL. `deletedAt` implements
soft deletion, while `isPrimary` selects the preferred application résumé.

## Company and job records

`CompanyMember` uses `(companyId, userId)` as its primary key and records owner/recruiter
membership. Company verification is independent from job moderation.

`Job` stores draft-capable nullable content, publication lifecycle, moderation lifecycle,
deadline, salary, experience, and discoverability metadata. Required and preferred skills
use `JobSkill`; screening questions have a stable order and required flag.

Public repository queries require all of the following:

- job status `PUBLISHED`;
- moderation status `CLEARED`;
- deadline later than the query time;
- company verification status `VERIFIED`.

## Application records

`Application` has a unique `(applicantId, jobId)` constraint. It references the exact
résumé chosen at submission. Answers retain a question snapshot so later wording changes
do not rewrite history.

`ApplicationStatusHistory` is append-only workflow evidence. `ApplicationMatch` stores the
structured and optional semantic components, matched/missing skill lists, explanation JSON,
model version, and calculation time. `RecruiterNote` is separate so applicant presenters
cannot accidentally include private review notes.

## Operational records

- `Notification` supports unread filtering and entity links per user.
- `EmailOutbox` stores encrypted payload JSON, claim/retry state, attempt count, error, and
  sent time.
- `AuditLog` stores administrator actor, action, entity, safe metadata, request ID, and IP.
- `JobEmbedding` and `ResumeEmbedding` store pgvector data, model name, and source-text hash.

## Integrity and deletion policy

- User-owned sessions, reset tokens, preferences, notifications, and profile child records
  cascade where losing the parent makes them meaningless.
- Jobs, applications, and submitted résumés use restrictive references where deletion would
  destroy hiring history.
- Jobs and résumés are archived/soft-deleted by services rather than physically removed from
  active workflow history.
- Skill deletion is restricted while applicant/job joins reference it.
- Application answers, history, matches, and notes cascade only when an application is
  intentionally removed in a controlled environment.

## Index strategy

Indexes cover role/status moderation filters, publication/deadline ordering, company and
applicant ownership, unread notifications, session/reset expiry, application status/time,
match score, outbox claim order, audit lookups, and embedding source hashes. Composite
unique constraints protect idempotent skills, one application per job, ordered screening
questions, membership, and saved jobs.

## Migrations and test isolation

Use committed migrations for repeatable environments:

```powershell
npm run db:deploy
```

Create and migrate the isolated test database with:

```powershell
npm run db:test:prepare
```

The reset helper refuses to truncate unless `DATABASE_URL` equals `DATABASE_URL_TEST` and
the database name ends in `_test`. It preserves Prisma migration history while truncating
application tables with cascade. Never point `DATABASE_URL_TEST` at development or
production data.

## Backup and production considerations

Production should use managed backups, point-in-time recovery, connection pooling, tested
restore procedures, least-privilege credentials, encrypted transport, and explicit résumé
retention. pgvector indexes should be selected and tuned only after representative corpus
and query-volume measurement.
