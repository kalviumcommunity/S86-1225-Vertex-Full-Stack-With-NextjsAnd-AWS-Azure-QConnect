'use client';
import React from 'react';

export default function UsersError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="p-6 flex flex-col items-center justify-center h-full">
      <h2 className="text-xl font-semibold text-red-600">Failed to load users</h2>
      <p className="text-gray-600 mt-2">{error?.message || 'Unable to load users at this time.'}</p>
      <button onClick={() => reset()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Try again
      </button>
    </main>
  );
}