"use client";
import React from "react";

interface FormInputProps {
  label: string;
  type?: string;
  register: any;
  name: string;
  error?: string | null;
  ariaLabel?: string;
}

export default function FormInput({ label, type = "text", register, name, error, ariaLabel }: FormInputProps) {
  return (
    <div className="mb-3">
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type={type}
        {...register(name)}
        className={`w-full border p-2 rounded ${error ? "border-red-500" : ""}`}
        aria-label={ariaLabel || label}
        aria-invalid={!!error}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
