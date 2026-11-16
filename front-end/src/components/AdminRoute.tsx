import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

/** Libera as rotas filhas apenas para administradores (o backend também valida). */
export function AdminRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
