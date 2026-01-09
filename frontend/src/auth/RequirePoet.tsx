import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequirePoet({ children }: { children: ReactNode }) {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/" replace />;
  }

  if (role !== "poet") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
