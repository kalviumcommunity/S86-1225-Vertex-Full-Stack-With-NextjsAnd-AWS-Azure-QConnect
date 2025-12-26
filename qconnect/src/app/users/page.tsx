import Link from "next/link";
import { prisma } from "@/lib/prisma";

import dynamic from "next/dynamic";
const UsersSWRList = dynamic(() => import("@/components/users/UsersSWRList"), { ssr: false });
const AddUser = dynamic(() => import("@/components/users/AddUser"), { ssr: false });

export default async function UsersPage() {
  // Optional artificial delay for demo/testing: set SLOW_FETCH_MS env var (number ms)
  const delayMs = process.env.SLOW_FETCH_MS ? Number(process.env.SLOW_FETCH_MS) : 0;
  if (delayMs && delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));

  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <ul className="mt-4 space-y-2">
        {users.map((u) => (
          <li key={u.id} className="p-2 border rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-sm text-gray-600">{u.email}</div>
              </div>
              <Link href={`/users/${u.id}`} className="text-blue-600">View</Link>
            </div>
          </li>
        ))}
      </ul>

      {/* Client-side SWR-powered list + add form */}
      <div className="mt-8">
        <p className="text-sm text-gray-500">Below is a client-side demo using SWR (stale-while-revalidate)</p>
      </div>

      {/* @ts-expect-error Server -> Client Component */}
      <div className="mt-4">
        {/* Client components */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <AddUser />
        {/* @ts-ignore */}
        <UsersSWRList />
      </div>
    </main>
  );
}
