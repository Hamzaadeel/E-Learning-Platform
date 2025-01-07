import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "learner" | "instructor">;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (
    allowedRoles &&
    currentUser.role &&
    !allowedRoles.includes(currentUser.role)
  ) {
    // Redirect to appropriate dashboard based on role
    switch (currentUser.role) {
      case "admin":
        return <Navigate to="/admin-dashboard" />;
      case "instructor":
        return <Navigate to="/instructor-dashboard" />;
      case "learner":
        return <Navigate to="/learner-dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
}
