import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
