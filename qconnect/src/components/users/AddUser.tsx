"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { toastSuccess, toastError } from "@/lib/toast";
import Spinner from "@/components/ui/Spinner";

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
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: `${name.replace(/\s+/g, "").toLowerCase()}@demo.local` }),
      });
      if (!res.ok) throw new Error("Failed to create user");

      // Revalidate
      mutate("/api/users");
      setName("");
      toastSuccess("User added");
    } catch (err: any) {
      setError(err.message || "Failed to add user");
      toastError(err.message || "Failed to add user");
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
        <button onClick={addUser} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2" disabled={loading}>
          {loading ? (
            <>
              <Spinner size={14} />
              <span>Adding…</span>
            </>
          ) : (
            "Add"
          )}
        </button>
      </div>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
