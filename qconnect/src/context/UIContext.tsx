"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface UIContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("demo_theme") : null;
      if (stored === "dark") setTheme("dark");
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("demo_theme", next);
      } catch {
        // ignore
      }
      console.log("Theme toggled to", next);
      return next;
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen((p) => !p);
    console.log("Sidebar toggled");
  };

  return (
    <UIContext.Provider value={{ theme, toggleTheme, sidebarOpen, toggleSidebar }}>{children}</UIContext.Provider>
  );
}

export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUIContext must be used within a UIProvider");
  return ctx;
}
