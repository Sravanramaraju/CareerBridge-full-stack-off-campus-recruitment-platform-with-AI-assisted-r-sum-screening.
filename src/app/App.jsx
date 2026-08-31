import { Route, Routes } from 'react-router-dom';

function FoundationPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <section className="w-full max-w-xl rounded-2xl border bg-card p-8 text-center">
        <p className="text-sm font-semibold text-primary">CareerBridge</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Frontend foundation is ready.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The early-career recruitment experience is being built from a clean JavaScript foundation.
        </p>
      </section>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="*" element={<FoundationPage />} />
    </Routes>
  );
}
