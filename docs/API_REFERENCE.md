# CareerBridge API reference

## Conventions

The development base URL is `http://localhost:4000/api/v1`. JSON successes use:

```json
{ "data": {} }
```

Errors use a stable code and safe message, with field errors when validation can be fixed
by the caller:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid values.",
    "requestId": "...",
    "fields": { "body.email": "Enter a valid email address." }
  }
}
```

List responses place `items` and `pagination` inside `data`. Page numbers are one-based.
IDs and slugs may be accepted interchangeably where the path says `:jobId` or
`:companyId`.

Authentication uses the `careerbridge_session` cookie. Authenticated `POST`, `PUT`,
`PATCH`, and `DELETE` requests must echo the `careerbridge_csrf` cookie value in the
`x-csrf-token` header and send the configured `Origin`. Browser requests should use
credentials mode `include`.

## Public and authentication

| Method | Path                         | Purpose                                                  |
| ------ | ---------------------------- | -------------------------------------------------------- |
| GET    | `/health`                    | API and database readiness                               |
| GET    | `/jobs`                      | Search/filter/paginate public jobs                       |
| GET    | `/jobs/:jobId`               | Public job detail                                        |
| GET    | `/companies`                 | Search/paginate verified companies                       |
| GET    | `/companies/:companyId`      | Public company detail with derived open-role count       |
| GET    | `/companies/:companyId/jobs` | Public jobs for one company                              |
| POST   | `/auth/login`                | Create cookie session                                    |
| POST   | `/auth/signup/applicant`     | Create applicant, profile, preferences, and session      |
| POST   | `/auth/signup/recruiter`     | Create recruiter, company, ownership, and session        |
| GET    | `/auth/me`                   | Restore current session                                  |
| POST   | `/auth/logout`               | Revoke current session and clear cookies                 |
| POST   | `/auth/forgot-password`      | Queue generic password-reset response/email              |
| POST   | `/auth/reset-password`       | Consume one-time token, change password, revoke sessions |

### Public job query

`GET /jobs` accepts `q`, `location`, `experience`, repeated `types`, `modes`,
`salaryBands`, `industries`, `skills`, `experiences`, `locations`, `companyTypes`,
`datePosted`, `sort` (`recommended`, `newest`, `salary`), `page`, and `pageSize` (maximum
50). Only published, moderation-cleared, unexpired jobs at verified companies are returned.

## Applicant

All endpoints require an active applicant session.

| Method | Path                                              | Purpose                                                   |
| ------ | ------------------------------------------------- | --------------------------------------------------------- |
| GET    | `/applicant/dashboard`                            | Profile summary, metrics, recent applications, saved jobs |
| GET    | `/applicant/recommendations`                      | Ranked explainable job recommendations                    |
| GET    | `/applicant/profile`                              | Complete applicant profile aggregate                      |
| PATCH  | `/applicant/profile`                              | Update base profile and preferences                       |
| POST   | `/applicant/education`                            | Add education                                             |
| PATCH  | `/applicant/education/:educationId`               | Update owned education                                    |
| DELETE | `/applicant/education/:educationId`               | Remove owned education                                    |
| POST   | `/applicant/experience`                           | Add experience                                            |
| PATCH  | `/applicant/experience/:experienceId`             | Update owned experience                                   |
| DELETE | `/applicant/experience/:experienceId`             | Remove owned experience                                   |
| POST   | `/applicant/projects`                             | Add project                                               |
| PATCH  | `/applicant/projects/:projectId`                  | Update owned project                                      |
| DELETE | `/applicant/projects/:projectId`                  | Remove owned project                                      |
| POST   | `/applicant/certifications`                       | Add certification                                         |
| PATCH  | `/applicant/certifications/:certificationId`      | Update owned certification                                |
| DELETE | `/applicant/certifications/:certificationId`      | Remove owned certification                                |
| PUT    | `/applicant/skills`                               | Idempotently replace normalized skill evidence            |
| GET    | `/applicant/resumes`                              | List active résumé metadata                               |
| POST   | `/applicant/resumes`                              | Upload one `resume` PDF/DOCX multipart field              |
| PATCH  | `/applicant/resumes/:resumeId/primary`            | Select primary résumé                                     |
| DELETE | `/applicant/resumes/:resumeId`                    | Soft-delete owned résumé                                  |
| GET    | `/resumes/:resumeId/content`                      | Stream authorized private résumé bytes                    |
| GET    | `/applicant/saved-jobs`                           | List saved public jobs                                    |
| PUT    | `/applicant/saved-jobs/:jobId`                    | Idempotently save a public job                            |
| DELETE | `/applicant/saved-jobs/:jobId`                    | Idempotently remove a saved job                           |
| POST   | `/jobs/:jobId/applications`                       | Submit résumé, cover note, and screening answers          |
| GET    | `/applicant/applications`                         | List owned applications                                   |
| GET    | `/applicant/applications/:applicationId`          | Owned application with status history                     |
| POST   | `/applicant/applications/:applicationId/withdraw` | Withdraw when state permits                               |
| GET    | `/jobs/:jobId/match`                              | Explain current applicant/job match                       |

## Recruiter

All endpoints require an active recruiter session and an owned company membership.

| Method | Path                                            | Purpose                                              |
| ------ | ----------------------------------------------- | ---------------------------------------------------- |
| GET    | `/recruiter/dashboard`                          | Company job/application metrics and activity         |
| GET    | `/recruiter/company`                            | Owned company workspace                              |
| PATCH  | `/recruiter/company`                            | Update owned company profile                         |
| GET    | `/recruiter/jobs`                               | List all owned job states                            |
| POST   | `/recruiter/jobs`                               | Create draft, skills, and screening questions        |
| GET    | `/recruiter/jobs/:jobId`                        | Read owned job                                       |
| PATCH  | `/recruiter/jobs/:jobId`                        | Update owned job; published edits require moderation |
| POST   | `/recruiter/jobs/:jobId/publish`                | Publish complete draft for moderation                |
| POST   | `/recruiter/jobs/:jobId/close`                  | Close published job                                  |
| POST   | `/recruiter/jobs/:jobId/reopen`                 | Reopen complete closed job                           |
| DELETE | `/recruiter/jobs/:jobId`                        | Archive owned job                                    |
| GET    | `/recruiter/jobs/:jobId/applications`           | Filter/paginate owned job candidates                 |
| GET    | `/recruiter/applications/:applicationId`        | Owned candidate detail and allowed transitions       |
| PATCH  | `/recruiter/applications/:applicationId/status` | Perform legal status transition                      |
| GET    | `/recruiter/applications/:applicationId/notes`  | List private company notes                           |
| POST   | `/recruiter/applications/:applicationId/notes`  | Add private note                                     |
| DELETE | `/recruiter/notes/:noteId`                      | Delete note authored by current recruiter            |
| GET    | `/resumes/:resumeId/content`                    | Stream résumé tied to an owned-company application   |

## Administrator

All endpoints require an active administrator session.

| Method | Path                                       | Purpose                                  |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/admin/dashboard`                         | Platform moderation metrics and activity |
| GET    | `/admin/companies`                         | Search/filter/paginate companies         |
| PATCH  | `/admin/companies/:companyId/verification` | Verify, request changes, or reject       |
| GET    | `/admin/jobs`                              | Search/filter/paginate jobs              |
| PATCH  | `/admin/jobs/:jobId/moderation`            | Clear, flag, or deactivate job           |
| GET    | `/admin/users`                             | Search/filter/paginate users             |
| PATCH  | `/admin/users/:userId/status`              | Suspend/reactivate and revoke sessions   |

## Shared authenticated endpoints

| Method | Path                                  | Purpose                                  |
| ------ | ------------------------------------- | ---------------------------------------- |
| GET    | `/settings`                           | Read role-aware notification settings    |
| PATCH  | `/settings`                           | Update allowed settings                  |
| GET    | `/notifications`                      | Paginate current-user notifications      |
| PATCH  | `/notifications/:notificationId/read` | Mark owned notification read             |
| PATCH  | `/notifications/read-all`             | Mark all current-user notifications read |

## Important status codes

- `200` read/update success; `201` created; `202` accepted generic recovery request
- `400` invalid/expired one-time token
- `401` missing, expired, revoked, suspended, or invalid authentication
- `403` valid session without role/ownership prerequisite, invalid origin, or invalid CSRF token
- `404` absent or deliberately concealed inaccessible resource
- `409` duplicate record, illegal lifecycle transition, or optimistic concurrency conflict
- `413`/`422` request size, file, or field validation failure
- `429` rate limit reached
