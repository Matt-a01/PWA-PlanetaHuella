import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface PublicOnlyRouteProps {
  children?: ReactNode;
}

// Redirige automáticamente a /inicio si el usuario ya cuenta con una sesión autenticada
export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
