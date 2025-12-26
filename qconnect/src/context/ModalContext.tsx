"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import ConfirmModal from "../components/ui/ConfirmModal";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ModalContextType = {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve?: (value: boolean) => void;
  }>({ open: false, options: {} });

  const confirm = useCallback((options: ConfirmOptions = {}) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    // resolve and close
    try {
      state.resolve?.(result);
    } finally {
      setState({ open: false, options: {} });
    }
  };

  return (
    <ModalContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        open={state.open}
        title={state.options.title ?? "Are you sure?"}
        description={state.options.description ?? "This action cannot be undone."}
        confirmLabel={state.options.confirmLabel ?? "Confirm"}
        cancelLabel={state.options.cancelLabel ?? "Cancel"}
        onConfirm={() => handleClose(true)}
        onCancel={() => handleClose(false)}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
}