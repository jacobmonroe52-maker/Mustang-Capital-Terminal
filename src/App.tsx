import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { AuthGuard } from './components/layout/AuthGuard';
import { DevRoleSwitcher } from './components/shared/DevRoleSwitcher';
import { Login } from './pages/Login';
import { Dashboard } from './pages/dashboard';
import { Pitches } from './pages/pitches';
import { DCF } from './pages/dcf';
import { Training } from './pages/training';
import { Research } from './pages/research';
import { DesignSystem } from './pages/DesignSystem';
import { initAuth } from './lib/auth';

export default function App() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initAuth().then((unsub) => { cleanup = unsub; });
    return () => cleanup?.();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Shell />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pitches" element={<Pitches />} />
          <Route path="dcf" element={<DCF />} />
          <Route path="training" element={<Training />} />
          <Route path="research" element={<Research />} />
          {import.meta.env.DEV && <Route path="design-system" element={<DesignSystem />} />}
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <DevRoleSwitcher />
    </BrowserRouter>
  );
}
