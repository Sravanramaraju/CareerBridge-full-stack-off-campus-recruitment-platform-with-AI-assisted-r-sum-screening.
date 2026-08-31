import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/src/layouts/PublicLayout';

function FoundationPage() {
  return (
    <section className="grid min-h-[65vh] place-items-center px-4">
      <section className="w-full max-w-xl rounded-2xl border bg-card p-8 text-center">
        <p className="text-sm font-semibold text-primary">CareerBridge</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Frontend foundation is ready.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The early-career recruitment experience is being built from a clean JavaScript foundation.
        </p>
      </section>
    </section>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="*" element={<FoundationPage />} />
      </Route>
    </Routes>
  );
}
