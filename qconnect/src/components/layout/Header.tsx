"use client";
import Link from "next/link";
import { useUIContext } from "@/context/UIContext";

export default function Header() {
  const { toggleSidebar, toggleTheme, theme } = useUIContext();

  return (
    <header className="w-full bg-brand text-white px-4 md:px-6 py-3 flex justify-between items-center" role="banner">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-2 rounded-md bg-black/10 md:hidden" aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M3 6h14M3 10h14M3 14h14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="font-semibold text-lg">QConnect</h1>
      </div>

      <div className="flex items-center gap-4">
        <nav aria-label="Main navigation" className="hidden md:flex gap-4">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/users" className="hover:underline">Users</Link>
        </nav>

        <button onClick={toggleTheme} className="p-2 rounded bg-black/10" aria-label="Toggle theme">
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        <Link href="/login" className="hidden md:inline-block hover:underline">Login</Link>
      </div>
    </header>
  );
}
