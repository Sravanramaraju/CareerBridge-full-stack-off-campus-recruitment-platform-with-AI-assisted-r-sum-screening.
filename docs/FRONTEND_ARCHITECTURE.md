# CareerBridge frontend architecture

## Overview

CareerBridge is a React 19 single-page application built with Vite. Production business
state comes from the Express API; there is no browser-persisted mock job, profile,
application, moderation, or notification state. Static career guides remain local content.

`src/main.jsx` mounts the application with shared providers and `src/app/App.jsx` defines
lazy route modules. The development server proxies `/api` to `127.0.0.1:4000`.

## Providers and state

`AppProviders` composes:

- TanStack Query for remote server state, cache lifetimes, mutations, and invalidation;
- `AuthProvider` for initial `/auth/me` cookie-session restoration;
- `ThemeProvider` for light/dark/system presentation preferences;
- `ToastProvider` for mutation feedback.

Zustand stores only the current safe session representation and bootstrap status. Session
tokens never enter JavaScript or localStorage. Theme preference is the only intentional
localStorage use.

## HTTP boundary

`src/services/apiClient.js` is the shared fetch adapter. It:

- prefixes `/api/v1` unless `VITE_API_BASE_URL` overrides it;
- always sends credentials;
- adds JSON content headers when appropriate;
- reads the CSRF cookie and supplies `x-csrf-token` for unsafe methods;
- maps normalized server errors into `ApiError` with code, status, fields, and request ID;
- preserves `AbortError` and converts transport failures into `NETWORK_ERROR`.

Domain services keep endpoint details out of pages:

- `authService`, `jobsService`, and `companiesService`;
- `profilesService`, `resumesService`, `savedJobsService`, and `applicationsService`;
- `dashboardService`, `recruiterService`, `adminService`;
- `settingsService` and `notificationsService`.

`queryKeys.js` centralizes stable cache ownership. Mutations invalidate all views that can
show the changed record; for example an application status update refreshes recruiter
detail/pipeline/dashboard and applicant views on their next observation.

## Route structure

### Public and authentication

| Route                                               | Page                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| `/`                                                 | Rich home page with live featured jobs/companies                        |
| `/jobs`                                             | URL-driven search, facets, sort, pagination, loading/error/empty states |
| `/jobs/:jobId`                                      | Server job detail, screening preview, save/apply/match actions          |
| `/companies`                                        | Verified company directory                                              |
| `/companies/:companyId`                             | Company detail and derived active jobs                                  |
| `/resources`                                        | Static fictional career resources                                       |
| `/login`                                            | Cookie login and demo credential selection                              |
| `/signup`, `/signup/applicant`, `/signup/recruiter` | Account choices and validated signup                                    |
| `/forgot-password`                                  | Privacy-preserving password recovery request                            |

Unknown public URLs render the not-found page.

### Applicant

Applicant routes are guarded by `RoleGuard` and use `ApplicantLayout`:

- `/applicant/dashboard`
- `/applicant/profile`
- `/applicant/saved-jobs`
- `/applicant/applications`
- `/applicant/applications/:applicationId`
- `/applicant/notifications`
- `/applicant/settings`

The profile page edits server profile sections and repeated records, replaces normalized
skills, uploads/opens/selects/deletes résumés, and presents extraction suggestions for
explicit review. Application pages show the server status code/label, immutable timeline,
selected résumé, and withdrawal availability.

### Recruiter

Recruiter routes use `RecruiterLayout`:

- `/recruiter/dashboard`
- `/recruiter/jobs`
- `/recruiter/jobs/new`
- `/recruiter/jobs/:jobId/edit`
- `/recruiter/jobs/:jobId/applicants`
- `/recruiter/candidates/:applicationId`
- `/recruiter/company`
- `/recruiter/notifications`
- `/recruiter/settings`

The multi-step job form saves drafts and supports required/preferred skills plus up to five
required/optional screening questions. Job management follows the server lifecycle.
Candidate actions use the server-provided `allowedTransitions`; private notes and résumé
access are never included in applicant queries.

### Administrator

Administrator routes use `AdminLayout`:

- `/admin/dashboard`
- `/admin/companies`
- `/admin/jobs`
- `/admin/users`

Tables are backed by paginated server queries. Moderation mutations use explicit
confirmation/reason UI and invalidate dashboard/list caches.

## Form and validation strategy

React Hook Form and Zod provide client feedback for login/signup, applicant profile
records, recruiter jobs, and screening answers. Server validation remains authoritative;
`ApiError.fields` can be mapped back to the relevant controls. Destructive/lifecycle
actions use confirmations and disable duplicate submissions while pending.

## Accessibility and responsive behavior

The interface includes a skip link, semantic landmarks, associated labels, keyboard-focus
styles, descriptive control names, live loading/error feedback, and non-color-only status
labels. Public and role layouts adapt navigation to small screens, while cards/tables/forms
reflow rather than requiring desktop width. Modals maintain named actions and escape/close
behavior through the shared UI layer.

## Loading, error, and empty states

Remote pages distinguish initial loading, retryable error, and valid empty results. Shared
feedback components keep these states visually consistent. Mutations surface server-safe
messages through toasts or inline alerts and preserve user input when recovery is possible.

## Testing

Frontend Vitest runs only `src/**/*.test.{js,jsx}`. Tests use Testing Library and mock the
HTTP service boundary, retaining coverage for authentication bootstrap/logout, route
guards, search URL behavior, cards, job form, profile/resume interactions, settings,
notifications, and query invalidation. Backend and PostgreSQL suites run separately; see
`docs/TESTING.md`.

## Adding a feature

1. Add or extend the server contract first.
2. Add a method to the appropriate service and a stable query key.
3. Build a query/mutation hook or focused page integration.
4. Cover loading/error/empty/success states and accessibility names.
5. Add isolated frontend tests and cross-module PostgreSQL integration coverage when the
   change affects persistence, transactions, or ownership.
