"use client";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

type User = { id?: number; name?: string; email?: string } | null;

interface AuthContextType {
  user: User;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    // Optional: hydrate user from cookie / localStorage (demo only)
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("demo_user") : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const login = (u: User) => {
    setUser(u);
    try {
      localStorage.setItem("demo_user", JSON.stringify(u));
    } catch {
      // ignore
    }
    console.log("User logged in:", u);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("demo_user");
    } catch {
      // ignore
    }
    console.log("User logged out");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
}
