"use client";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { toastSuccess, toastError } from "@/lib/toast";
import Spinner from "@/components/ui/Spinner";

export default function UsersSWRList() {
  const { data, error, isValidating } = useSWR("/api/users", fetcher, { revalidateOnFocus: true });
  const { confirm } = useModal();
  const [deleting, setDeleting] = useState<string | null>(null);

  if (error) return <p className="text-red-600">Failed to load users: {error.message}</p>;
  if (!data) return <p>Loading...</p>;

  const users = data.data || [];

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: "Delete user?", description: "This action will permanently delete the user." });
    if (!ok) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toastSuccess("User deleted");
      mutate("/api/users");
    } catch (err: any) {
      toastError(err.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Client (SWR) Users</h3>
      {isValidating && <p className="text-sm text-gray-500">Refreshing…</p>}
      <ul className="mt-3 space-y-2">
        {users.map((u: any) => (
          <li key={u.id} className="p-2 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-sm text-gray-600">{u.email}</div>
            </div>
            <div className="flex items-center gap-2">
              {deleting === u.id ? <Spinner size={18} /> : (
                <button onClick={() => handleDelete(u.id)} className="px-2 py-1 rounded bg-red-600 text-white text-sm">
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
