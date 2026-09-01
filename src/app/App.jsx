import { Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/src/layouts/AuthLayout';
import { RoleGuard } from '@/src/components/auth/RoleGuard';
import { ApplicantLayout } from '@/src/layouts/ApplicantLayout';
import { RecruiterLayout } from '@/src/layouts/RecruiterLayout';
import { PublicLayout } from '@/src/layouts/PublicLayout';
import { ForgotPasswordPage } from '@/src/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/src/pages/auth/LoginPage';
import { RoleSignupPage } from '@/src/pages/auth/RoleSignupPage';
import { SignupPage } from '@/src/pages/auth/SignupPage';
import { ApplicantDashboardPage } from '@/src/pages/applicant/ApplicantDashboardPage';
import { ApplicationDetailPage } from '@/src/pages/applicant/ApplicationDetailPage';
import { ApplicationsPage } from '@/src/pages/applicant/ApplicationsPage';
import { SavedJobsPage } from '@/src/pages/applicant/SavedJobsPage';
import { ApplicantSettingsPage } from '@/src/pages/applicant/ApplicantSettingsPage';
import { ProfilePage } from '@/src/pages/applicant/ProfilePage';
import { RecruiterDashboardPage } from '@/src/pages/recruiter/RecruiterDashboardPage';
import { CompaniesPage } from '@/src/pages/public/CompaniesPage';
import { CompanyDetailPage } from '@/src/pages/public/CompanyDetailPage';
import { HomePage } from '@/src/pages/public/HomePage';
import { JobDetailPage } from '@/src/pages/public/JobDetailPage';
import { JobsPage } from '@/src/pages/public/JobsPage';
import { NotFoundPage } from '@/src/pages/public/NotFoundPage';
import { ResourcesPage } from '@/src/pages/public/ResourcesPage';

export function App() {
  return (
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
      </Route>
    </Routes>
  );
}
