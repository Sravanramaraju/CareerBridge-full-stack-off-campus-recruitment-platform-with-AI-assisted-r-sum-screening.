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
