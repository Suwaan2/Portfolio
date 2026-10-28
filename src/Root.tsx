import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import App from './App.tsx';

// The admin panel is its own chunk, so visitors never download it
const AdminApp = lazy(() => import('./admin/AdminApp.tsx'));

export function Root() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={null}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<App />} />
    </Routes>
  );
}
