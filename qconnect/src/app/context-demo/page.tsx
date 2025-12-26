"use client";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

export default function ContextDemo() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();

  return (
    <main className={`p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h1 className="text-2xl font-bold mb-4">Context & Hooks Demo</h1>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Auth State</h2>
        {isAuthenticated ? (
          <>
            <p>Logged in as: {user?.name || user?.email || "(unknown)"}</p>
            <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded mt-2">Logout</button>
          </>
        ) : (
          <button onClick={() => login({ name: "DemoUser", email: "demo@example.com" })} className="bg-green-500 text-white px-3 py-1 rounded">Login</button>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">UI Controls</h2>
        <p>Current Theme: {theme}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={toggleTheme} className="bg-blue-500 text-white px-3 py-1 rounded">Toggle Theme</button>
          <button onClick={toggleSidebar} className="bg-yellow-500 text-black px-3 py-1 rounded">{sidebarOpen ? "Close Sidebar" : "Open Sidebar"}</button>
        </div>
      </section>
    </main>
  );
}
