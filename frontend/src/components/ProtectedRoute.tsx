import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
  /** Rendered in place (URL unchanged) for signed-out visitors, instead of redirecting to /welcome. */
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
}
