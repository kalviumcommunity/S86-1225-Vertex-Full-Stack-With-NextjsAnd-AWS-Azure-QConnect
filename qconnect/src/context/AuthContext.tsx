"use client";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

type User = { id?: number; name?: string; email?: string; role?: string } | null;

interface AuthContextType {
  user: User;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    // Attempt to hydrate user by calling /api/auth/me (cookies are sent via same-origin)
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success && json.data) {
          setUser(json.data.user);
          try { localStorage.setItem("demo_user", JSON.stringify(json.data.user)); } catch {}
        }
      } catch {
        // ignore
      }
    };
    fetchMe();

    // Also fallback to localStorage for demo
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("demo_user") : null;
      if (raw && !user) setUser(JSON.parse(raw));
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

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch (e) {
      console.error("Logout request failed", e);
    }
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
