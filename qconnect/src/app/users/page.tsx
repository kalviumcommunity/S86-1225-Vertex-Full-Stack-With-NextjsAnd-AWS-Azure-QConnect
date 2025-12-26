import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
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
    </main>
  );
}
