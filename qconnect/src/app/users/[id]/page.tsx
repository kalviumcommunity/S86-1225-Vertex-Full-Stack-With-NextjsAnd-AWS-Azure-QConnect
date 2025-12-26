import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const id = Number(params.id);
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } });

  if (!user) {
    return (
      <main className="p-6">
        <h2>User not found</h2>
        <Link href="/users">Back to users</Link>
      </main>
    );
  }

  return (
    <main className="p-6">
      <nav className="mb-4">
        <Link href="/users" className="text-blue-600">← Back to users</Link>
      </nav>
      <h2 className="text-xl font-bold">{user.name}</h2>
      <p className="mt-2">Email: {user.email}</p>
      <p className="mt-1">Phone: {user.phone || '-'}</p>
      <p className="mt-1">Role: {user.role}</p>
      <p className="mt-1 text-sm text-gray-600">Joined: {user.createdAt.toISOString()}</p>
    </main>
  );
}
