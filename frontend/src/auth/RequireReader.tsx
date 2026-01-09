import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireReader({ children }: { children: ReactNode }) {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/" replace />;
  }

  if (role !== "cititor") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
