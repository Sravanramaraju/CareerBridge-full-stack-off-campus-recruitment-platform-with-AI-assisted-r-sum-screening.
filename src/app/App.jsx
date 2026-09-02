import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteLoading } from '@/src/components/feedback/RouteLoading';
import { RoleGuard } from '@/src/components/auth/RoleGuard';
import { PublicLayout } from '@/src/layouts/PublicLayout';

const HomePage = lazy(() => import('@/src/pages/public/HomePage').then((module) => ({ default: module.HomePage })));
const JobsPage = lazy(() => import('@/src/pages/public/JobsPage').then((module) => ({ default: module.JobsPage })));
const JobDetailPage = lazy(() => import('@/src/pages/public/JobDetailPage').then((module) => ({ default: module.JobDetailPage })));
const CompaniesPage = lazy(() => import('@/src/pages/public/CompaniesPage').then((module) => ({ default: module.CompaniesPage })));
const CompanyDetailPage = lazy(() => import('@/src/pages/public/CompanyDetailPage').then((module) => ({ default: module.CompanyDetailPage })));
const ResourcesPage = lazy(() => import('@/src/pages/public/ResourcesPage').then((module) => ({ default: module.ResourcesPage })));
const NotFoundPage = lazy(() => import('@/src/pages/public/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const AuthLayout = lazy(() => import('@/src/layouts/AuthLayout').then((module) => ({ default: module.AuthLayout })));
const ApplicantLayout = lazy(() => import('@/src/layouts/ApplicantLayout').then((module) => ({ default: module.ApplicantLayout })));
const RecruiterLayout = lazy(() => import('@/src/layouts/RecruiterLayout').then((module) => ({ default: module.RecruiterLayout })));
const AdminLayout = lazy(() => import('@/src/layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })));
const LoginPage = lazy(() => import('@/src/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('@/src/pages/auth/SignupPage').then((module) => ({ default: module.SignupPage })));
const RoleSignupPage = lazy(() => import('@/src/pages/auth/RoleSignupPage').then((module) => ({ default: module.RoleSignupPage })));
const ForgotPasswordPage = lazy(() => import('@/src/pages/auth/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })));
const ApplicantDashboardPage = lazy(() => import('@/src/pages/applicant/ApplicantDashboardPage').then((module) => ({ default: module.ApplicantDashboardPage })));
const SavedJobsPage = lazy(() => import('@/src/pages/applicant/SavedJobsPage').then((module) => ({ default: module.SavedJobsPage })));
const ApplicationsPage = lazy(() => import('@/src/pages/applicant/ApplicationsPage').then((module) => ({ default: module.ApplicationsPage })));
const ApplicationDetailPage = lazy(() => import('@/src/pages/applicant/ApplicationDetailPage').then((module) => ({ default: module.ApplicationDetailPage })));
const ProfilePage = lazy(() => import('@/src/pages/applicant/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const ApplicantSettingsPage = lazy(() => import('@/src/pages/applicant/ApplicantSettingsPage').then((module) => ({ default: module.ApplicantSettingsPage })));
const ApplicantNotificationsPage = lazy(() => import('@/src/pages/applicant/ApplicantNotificationsPage').then((module) => ({ default: module.ApplicantNotificationsPage })));
const RecruiterDashboardPage = lazy(() => import('@/src/pages/recruiter/RecruiterDashboardPage').then((module) => ({ default: module.RecruiterDashboardPage })));
const RecruiterJobsPage = lazy(() => import('@/src/pages/recruiter/RecruiterJobsPage').then((module) => ({ default: module.RecruiterJobsPage })));
const JobFormPage = lazy(() => import('@/src/pages/recruiter/JobFormPage').then((module) => ({ default: module.JobFormPage })));
const CandidatePipelinePage = lazy(() => import('@/src/pages/recruiter/CandidatePipelinePage').then((module) => ({ default: module.CandidatePipelinePage })));
const CandidateDetailPage = lazy(() => import('@/src/pages/recruiter/CandidateDetailPage').then((module) => ({ default: module.CandidateDetailPage })));
const RecruiterCompanyPage = lazy(() => import('@/src/pages/recruiter/RecruiterCompanyPage').then((module) => ({ default: module.RecruiterCompanyPage })));
const RecruiterNotificationsPage = lazy(() => import('@/src/pages/recruiter/RecruiterNotificationsPage').then((module) => ({ default: module.RecruiterNotificationsPage })));
const RecruiterSettingsPage = lazy(() => import('@/src/pages/recruiter/RecruiterSettingsPage').then((module) => ({ default: module.RecruiterSettingsPage })));
const AdminDashboardPage = lazy(() => import('@/src/pages/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })));
const AdminCompaniesPage = lazy(() => import('@/src/pages/admin/AdminCompaniesPage').then((module) => ({ default: module.AdminCompaniesPage })));
const AdminJobsPage = lazy(() => import('@/src/pages/admin/AdminJobsPage').then((module) => ({ default: module.AdminJobsPage })));
const AdminUsersPage = lazy(() => import('@/src/pages/admin/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })));

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
        <Route path="applicant/notifications" element={<ApplicantNotificationsPage />} />
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
