import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteLoading } from '@/src/components/feedback/RouteLoading';
import { AuthLayout } from '@/src/layouts/AuthLayout';
import { RoleGuard } from '@/src/components/auth/RoleGuard';
import { ApplicantLayout } from '@/src/layouts/ApplicantLayout';
import { RecruiterLayout } from '@/src/layouts/RecruiterLayout';
import { AdminLayout } from '@/src/layouts/AdminLayout';
import { PublicLayout } from '@/src/layouts/PublicLayout';
import { ApplicantDashboardPage } from '@/src/pages/applicant/ApplicantDashboardPage';
import { ApplicationDetailPage } from '@/src/pages/applicant/ApplicationDetailPage';
import { ApplicationsPage } from '@/src/pages/applicant/ApplicationsPage';
import { SavedJobsPage } from '@/src/pages/applicant/SavedJobsPage';
import { ApplicantSettingsPage } from '@/src/pages/applicant/ApplicantSettingsPage';
import { ProfilePage } from '@/src/pages/applicant/ProfilePage';
import { RecruiterDashboardPage } from '@/src/pages/recruiter/RecruiterDashboardPage';
import { AdminDashboardPage } from '@/src/pages/admin/AdminDashboardPage';
import { AdminCompaniesPage } from '@/src/pages/admin/AdminCompaniesPage';
import { AdminJobsPage } from '@/src/pages/admin/AdminJobsPage';
import { AdminUsersPage } from '@/src/pages/admin/AdminUsersPage';
import { RecruiterJobsPage } from '@/src/pages/recruiter/RecruiterJobsPage';
import { RecruiterCompanyPage } from '@/src/pages/recruiter/RecruiterCompanyPage';
import { RecruiterNotificationsPage } from '@/src/pages/recruiter/RecruiterNotificationsPage';
import { RecruiterSettingsPage } from '@/src/pages/recruiter/RecruiterSettingsPage';
import { JobFormPage } from '@/src/pages/recruiter/JobFormPage';
import { CandidateDetailPage } from '@/src/pages/recruiter/CandidateDetailPage';
import { CandidatePipelinePage } from '@/src/pages/recruiter/CandidatePipelinePage';

const HomePage = lazy(() => import('@/src/pages/public/HomePage').then((module) => ({ default: module.HomePage })));
const JobsPage = lazy(() => import('@/src/pages/public/JobsPage').then((module) => ({ default: module.JobsPage })));
const JobDetailPage = lazy(() => import('@/src/pages/public/JobDetailPage').then((module) => ({ default: module.JobDetailPage })));
const CompaniesPage = lazy(() => import('@/src/pages/public/CompaniesPage').then((module) => ({ default: module.CompaniesPage })));
const CompanyDetailPage = lazy(() => import('@/src/pages/public/CompanyDetailPage').then((module) => ({ default: module.CompanyDetailPage })));
const ResourcesPage = lazy(() => import('@/src/pages/public/ResourcesPage').then((module) => ({ default: module.ResourcesPage })));
const NotFoundPage = lazy(() => import('@/src/pages/public/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const LoginPage = lazy(() => import('@/src/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('@/src/pages/auth/SignupPage').then((module) => ({ default: module.SignupPage })));
const RoleSignupPage = lazy(() => import('@/src/pages/auth/RoleSignupPage').then((module) => ({ default: module.RoleSignupPage })));
const ForgotPasswordPage = lazy(() => import('@/src/pages/auth/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })));

export function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:jobId" element={<JobDetailPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/:companyId" element={<CompanyDetailPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="signup/applicant" element={<RoleSignupPage accountType="applicant" />} />
        <Route path="signup/recruiter" element={<RoleSignupPage accountType="recruiter" />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route element={<RoleGuard allowedRole="applicant"><ApplicantLayout /></RoleGuard>}>
        <Route path="applicant/dashboard" element={<ApplicantDashboardPage />} />
        <Route path="applicant/saved-jobs" element={<SavedJobsPage />} />
        <Route path="applicant/applications" element={<ApplicationsPage />} />
        <Route path="applicant/applications/:applicationId" element={<ApplicationDetailPage />} />
        <Route path="applicant/profile" element={<ProfilePage />} />
        <Route path="applicant/settings" element={<ApplicantSettingsPage />} />
      </Route>
      <Route element={<RoleGuard allowedRole="recruiter"><RecruiterLayout /></RoleGuard>}>
        <Route path="recruiter/dashboard" element={<RecruiterDashboardPage />} />
        <Route path="recruiter/jobs" element={<RecruiterJobsPage />} />
        <Route path="recruiter/jobs/new" element={<JobFormPage />} />
        <Route path="recruiter/jobs/:jobId/edit" element={<JobFormPage />} />
        <Route path="recruiter/jobs/:jobId/applicants" element={<CandidatePipelinePage />} />
        <Route path="recruiter/candidates/:applicationId" element={<CandidateDetailPage />} />
        <Route path="recruiter/company" element={<RecruiterCompanyPage />} />
        <Route path="recruiter/notifications" element={<RecruiterNotificationsPage />} />
        <Route path="recruiter/settings" element={<RecruiterSettingsPage />} />
      </Route>
      <Route element={<RoleGuard allowedRole="admin"><AdminLayout /></RoleGuard>}>
        <Route path="admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="admin/companies" element={<AdminCompaniesPage />} />
        <Route path="admin/jobs" element={<AdminJobsPage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
      </Route>
      </Routes>
    </Suspense>
  );
}
