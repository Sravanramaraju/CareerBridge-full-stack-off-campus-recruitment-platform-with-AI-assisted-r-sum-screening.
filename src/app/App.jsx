import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/src/layouts/PublicLayout';
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
    </Routes>
  );
}
