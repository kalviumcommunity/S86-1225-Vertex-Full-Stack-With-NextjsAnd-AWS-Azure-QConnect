"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || "Login failed");
        return;
      }

      // Cookies for access + refresh are set by the server (HttpOnly). Navigate to dashboard.
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <main className="flex flex-col items-center mt-10">
      <h1 className="text-xl font-semibold">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4 w-80">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="px-3 py-2 border rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" className="px-3 py-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Sign in</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </main>
  );
}
