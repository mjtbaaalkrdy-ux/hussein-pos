import { Navigate } from "react-router-dom";
import useAuth from "../store/auth";

export default function ProtectedRoute({ children, roles }) {
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.token);

  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
}
