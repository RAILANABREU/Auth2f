import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  require2FA?: boolean;
}

export const ProtectedRoute = ({ children, require2FA = false }: ProtectedRouteProps) => {
  const { accessToken, pre2faToken } = useAuthStore();

  if (require2FA && !pre2faToken) {
    return <Navigate to="/login" replace />;
  }

  if (!require2FA && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
