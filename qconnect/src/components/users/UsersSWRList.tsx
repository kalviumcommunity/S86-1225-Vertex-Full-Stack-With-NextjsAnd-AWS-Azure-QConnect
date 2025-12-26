"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function UsersSWRList() {
  const { data, error, isValidating } = useSWR("/api/users", fetcher, { revalidateOnFocus: true });

  if (error) return <p className="text-red-600">Failed to load users: {error.message}</p>;
  if (!data) return <p>Loading...</p>;

  const users = data.data || [];

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Client (SWR) Users</h3>
      {isValidating && <p className="text-sm text-gray-500">Refreshing…</p>}
      <ul className="mt-3 space-y-2">
        {users.map((u: any) => (
          <li key={u.id} className="p-2 border rounded">
            <div className="font-medium">{u.name}</div>
            <div className="text-sm text-gray-600">{u.email}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
