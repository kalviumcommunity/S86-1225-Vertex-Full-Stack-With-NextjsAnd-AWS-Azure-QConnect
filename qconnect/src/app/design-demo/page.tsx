"use client";
import React from "react";

export default function DesignDemo() {
  return (
    <main className="p-4 md:p-8 lg:p-12">
      <h1 className="text-lg md:text-2xl lg:text-3xl font-semibold mb-4">Responsive & Themed Design Demo</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded shadow bg-white dark:bg-gray-800">
          <h2 className="font-medium text-base md:text-lg">Card 1</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">This card demonstrates responsive grid behavior.</p>
        </div>

        <div className="p-4 rounded shadow bg-white dark:bg-gray-800">
          <h2 className="font-medium text-base md:text-lg">Card 2</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Resize the viewport to see layout changes.</p>
        </div>

        <div className="p-4 rounded shadow bg-white dark:bg-gray-800">
          <h2 className="font-medium text-base md:text-lg">Card 3</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Colors adapt to light/dark theme.</p>
        </div>
      </section>

      <div className="mt-6">
        <p className="text-sm">Brand color examples:</p>
        <div className="flex gap-2 mt-2">
          <div className="w-16 h-10 rounded bg-brand-light" />
          <div className="w-16 h-10 rounded bg-brand" />
          <div className="w-16 h-10 rounded bg-brand-dark" />
        </div>
      </div>
    </main>
  );
}