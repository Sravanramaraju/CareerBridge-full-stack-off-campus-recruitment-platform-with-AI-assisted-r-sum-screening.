# CareerBridge

CareerBridge is a responsive off-campus recruitment portal for students, graduates, recruiters, and platform administrators. This repository currently contains the production-ready frontend prototype, built with realistic local data and persistent demo workflows so the experience can be evaluated before backend integration.

## Core experiences

- Public job discovery with keyword, location, experience, employment, work-mode, salary, industry, skill, and date filters
- Verified company profiles and career resources
- Applicant profile, saved jobs, applications, status timelines, preferences, and simulated resume analysis
- Recruiter dashboard, multi-step job posting, candidate pipeline, candidate details, notes, company profile, and notifications
- Admin dashboards for company, job, and user moderation
- Role-aware demo authentication, light and dark themes, responsive layouts, and accessible interaction states

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown by Vite. The project requires Node.js 22.13 or newer.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Applicant | `applicant@careerbridge.demo` | `demo1234` |
| Recruiter | `recruiter@careerbridge.demo` | `demo1234` |
| Admin | `admin@careerbridge.demo` | `demo1234` |

The frontend intentionally labels simulated resume analysis and match guidance. These features do not claim to make automated hiring decisions.

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

## Technology

React 19, Vite, React Router, TanStack Query, Zustand, React Hook Form, Zod, Tailwind CSS, Lucide icons, Vitest, and Testing Library.

## Frontend architecture

- `src/app` owns routing and top-level providers.
- `src/pages` contains route-level public, applicant, recruiter, and admin experiences.
- `src/components` contains domain components and reusable UI primitives.
- `src/services` provides asynchronous mock boundaries that can later be replaced by backend APIs.
- `src/store` persists demo sessions and workflow changes in browser storage.
- `src/schemas` centralizes Zod validation for complex forms.

Route modules are lazy-loaded, public pages provide page-specific document titles, and role guards redirect users to the correct workspace. Job matching is deterministic and explainable: it uses job-relevant profile evidence only and is presented as guidance rather than an automated hiring decision.

## Local data behavior

This phase is deliberately frontend-only. Saving jobs, applying, posting roles, changing candidate status, adding recruiter notes, moderating records, and marking notifications as read are stored locally in the current browser. Clearing site storage restores the seeded demonstration state.

The automated suite covers application duplicate prevention, saved jobs, recruiter status history, moderation state, catalog filtering, URL filter persistence, route guards, accessible controls, JobCard behavior, authentication, and matching guardrails.
