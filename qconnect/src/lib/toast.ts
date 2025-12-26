"use client";
import { toast, Toaster } from "sonner";

export { Toaster };

export const toastSuccess = (message: string) => toast.success(message, { duration: 4000 });
export const toastError = (message: string) => toast.error(message, { duration: 6000 });
export const toastLoading = (message: string) => toast(message, { duration: 0 });
export const toastDismiss = (id?: string) => {
  // sonner returns an id when calling toast()
  // Not implementing id-based dismiss in this helper yet
  toast.dismiss();
};

export default toast;