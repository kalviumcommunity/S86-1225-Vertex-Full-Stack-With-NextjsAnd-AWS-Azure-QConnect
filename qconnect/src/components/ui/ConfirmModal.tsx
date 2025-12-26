"use client";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Tab" && dialogRef.current) {
        // Trap focus
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      }
    };

    if (open) {
      document.addEventListener("keydown", onKey);
      // lock scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // focus the dialog
      setTimeout(() => {
        const focusable = dialogRef.current?.querySelector<HTMLElement>("button, [href], input, textarea, select, [tabindex]");
        focusable?.focus();
      }, 10);

      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [open, onCancel]);

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded shadow-lg p-6"
        ref={dialogRef}
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="px-3 py-2 rounded bg-red-600 text-white">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}