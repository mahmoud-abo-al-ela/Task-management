import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  // Wait for the token check to finish, otherwise a refresh would bounce
  // a logged in user to the login page.
  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center text-fg-muted">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
