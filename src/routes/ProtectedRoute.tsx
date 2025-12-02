import { Navigate, Outlet } from "react-router";

// Props for ProtectedRoute
type ProtectedRouteProps = {
  allowedRoles: string[]; // roles that can access this route
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userRoleStr = localStorage.getItem("role") || "";
  // Split by comma, trim, and filter empty
  const userRoles = userRoleStr.split(",").map(r => r.trim()).filter(Boolean);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  console.log('User roles:', userRoles);
  // Case-insensitive check
  const hasRole = allowedRoles.some(allowed =>
    userRoles.some(userRole => userRole.toLowerCase() === allowed.toLowerCase())
  );
  if (!hasRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
