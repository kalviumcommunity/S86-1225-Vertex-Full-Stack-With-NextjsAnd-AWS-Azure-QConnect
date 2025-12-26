"use client";
import Link from "next/link";
import { useUIContext } from "@/context/UIContext";

export default function Sidebar() {
  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/users", label: "Users" },
    { href: "/feedback-demo", label: "Feedback demo" },
    { href: "/settings", label: "Settings" },
  ];

  const { sidebarOpen, toggleSidebar } = useUIContext();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 h-[calc(100vh-64px)] bg-surface border-r p-4 text-foreground" role="navigation" aria-label="Sidebar">
        <h2 className="text-lg font-bold mb-4">Navigation</h2>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-brand">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile slide-over */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={toggleSidebar} aria-hidden />
          <nav className="relative w-64 bg-surface p-4">
            <button onClick={toggleSidebar} className="mb-4 px-2 py-1 rounded bg-gray-100">Close</button>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={toggleSidebar} className="block py-2 hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
