import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "poet" | "cititor";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type AuthValue = {
  user: User | null;
  role: Role | null;
  login: (nextUser: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);
const STORAGE_KEY = "blogpoetry.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as User;
      if (
        typeof parsed?.id === "number" &&
        typeof parsed?.name === "string" &&
        typeof parsed?.email === "string" &&
        (parsed?.role === "poet" || parsed?.role === "cititor")
      ) {
        return parsed;
      }
    } catch {
      return null;
    }

    return null;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      login: (nextUser: User) => setUser(nextUser),
      logout: () => setUser(null)
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
