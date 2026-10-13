import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireRole({ role, children }) {
  const { currentUser, isAdmin } = useAuth();
  const allowed = currentUser && (role === "admin" ? isAdmin : !isAdmin);
  return allowed ? children : <Navigate to="/login" replace />;
}
