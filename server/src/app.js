import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { API_PREFIX, REQUEST_BODY_LIMIT } from './config/constants.js';
import { env } from './config/env.js';
import { csrfProtection } from './middleware/csrfProtection.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { requestLogger } from './middleware/requestLogger.js';
import { sessionAuth } from './middleware/sessionAuth.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { companyRouter } from './modules/companies/company.routes.js';
import { recruiterCompanyRouter } from './modules/companies/recruiterCompany.routes.js';
import { createHealthRouter } from './modules/health/health.routes.js';
import { jobRouter } from './modules/jobs/job.routes.js';
import { applicantCertificationRouter } from './modules/profiles/certification.routes.js';
import { applicantEducationRouter } from './modules/profiles/education.routes.js';
import { applicantExperienceRouter } from './modules/profiles/experience.routes.js';
import { applicantProfileRouter } from './modules/profiles/profile.routes.js';
import { applicantProjectRouter } from './modules/profiles/project.routes.js';
import { applicantSkillRouter } from './modules/profiles/skill.routes.js';
import { settingsRouter } from './modules/settings/settings.routes.js';

export function createApp({ databaseCheck } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(sessionAuth);
  app.use(csrfProtection);
  app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: false, limit: REQUEST_BODY_LIMIT }));

  app.use(`${API_PREFIX}/health`, createHealthRouter({ databaseCheck }));
  app.use(`${API_PREFIX}/auth`, authRouter);
  app.use(`${API_PREFIX}/companies`, companyRouter);
  app.use(`${API_PREFIX}/jobs`, jobRouter);
  app.use(`${API_PREFIX}/recruiter/company`, recruiterCompanyRouter);
  app.use(`${API_PREFIX}/applicant/profile`, applicantProfileRouter);
  app.use(`${API_PREFIX}/applicant/education`, applicantEducationRouter);
  app.use(`${API_PREFIX}/applicant/experience`, applicantExperienceRouter);
  app.use(`${API_PREFIX}/applicant/projects`, applicantProjectRouter);
  app.use(`${API_PREFIX}/applicant/certifications`, applicantCertificationRouter);
  app.use(`${API_PREFIX}/applicant/skills`, applicantSkillRouter);
  app.use(`${API_PREFIX}/settings`, settingsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
