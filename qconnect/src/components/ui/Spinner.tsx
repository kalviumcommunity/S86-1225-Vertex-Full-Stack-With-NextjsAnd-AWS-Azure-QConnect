"use client";
import React from "react";

export default function Spinner({ size = 20 }: { size?: number }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 50 50"
      className="animate-spin"
      aria-hidden="true"
      role="status"
    >
      <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#e5e7eb" />
      <path d="M45 25a20 20 0 0 0-20-20" fill="none" strokeWidth="5" stroke="#2563eb" strokeLinecap="round" />
    </svg>
  );
}