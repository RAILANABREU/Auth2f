import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  require2FA?: boolean;
}

export const ProtectedRoute = ({
  children,
  require2FA = false,
}: ProtectedRouteProps) => {
  const { accessToken, pre2faToken } = useAuthStore();

  const tokenFromSession =
    typeof window !== "undefined"
      ? sessionStorage.getItem("accessToken")
      : null;

  if (require2FA && !pre2faToken) {
    return <Navigate to="/login" replace />;
  }

  // usa fallback do sessionStorage para evitar corrida de estado após 2FA
  if (!require2FA && !(accessToken || tokenFromSession)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
