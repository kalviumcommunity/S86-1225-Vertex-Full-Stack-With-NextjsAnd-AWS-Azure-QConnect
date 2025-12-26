"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-blue-600 text-white px-6 py-3 flex justify-between items-center" role="banner">
      <h1 className="font-semibold text-lg">QConnect</h1>
      <nav aria-label="Main navigation">
        <ul className="flex gap-4">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          <li>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          </li>
          <li>
            <Link href="/users" className="hover:underline">Users</Link>
          </li>
          <li>
            <Link href="/login" className="hover:underline">Login</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
