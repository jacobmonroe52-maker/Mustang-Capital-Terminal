import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../ui/Spinner';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { profile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-950">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-cream-400 text-sm">Loading Mustang Terminal...</p>
        </div>
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
