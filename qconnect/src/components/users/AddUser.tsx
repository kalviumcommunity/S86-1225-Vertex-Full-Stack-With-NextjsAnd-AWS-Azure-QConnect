"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";

export default function AddUser() {
  const { data } = useSWR("/api/users", fetcher);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUser = async () => {
    if (!name) return;
    setLoading(true);
    setError(null);

    // Optimistic update
    const optimistic = [...(data?.data || []), { id: Date.now(), name, email: `${name.replace(/\s+/g, "").toLowerCase()}@demo.local` }];
    mutate("/api/users", { ...data, data: optimistic }, false);

    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: `${name.replace(/\s+/g, "").toLowerCase()}@demo.local` }),
      });

      // Revalidate
      mutate("/api/users");
      setName("");
    } catch (err: any) {
      setError(err.message || "Failed to add user");
      // Rollback
      mutate("/api/users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Add User (optimistic)</h3>
      <div className="flex gap-2 mt-2">
        <input className="border px-2 py-1 flex-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <button onClick={addUser} className="bg-blue-600 text-white px-3 py-1 rounded" disabled={loading}>
          {loading ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
