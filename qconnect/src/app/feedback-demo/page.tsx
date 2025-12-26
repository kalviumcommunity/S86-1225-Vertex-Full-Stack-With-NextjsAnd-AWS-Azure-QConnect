"use client";
import { useState } from "react";
import { toastSuccess, toastError, toastLoading, toastDismiss } from "@/lib/toast";
import { useModal } from "@/context/ModalContext";
import Spinner from "@/components/ui/Spinner";

export default function FeedbackDemo() {
  const { confirm } = useModal();
  const [loading, setLoading] = useState(false);

  const runFlow = async () => {
    const ok = await confirm({ title: "Run demo process?", description: "This will simulate a long-running task." });
    if (!ok) return;
    setLoading(true);
    const id = toastLoading("Processing…");
    try {
      await new Promise((r) => setTimeout(r, 2000));
      toastSuccess("Process completed successfully");
    } catch (e) {
      toastError("Process failed");
    } finally {
      setLoading(false);
      toastDismiss();
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Feedback demo</h1>
      <div className="space-y-4">
        <div>
          <button onClick={() => toastSuccess("Saved!")} className="px-3 py-2 bg-green-600 text-white rounded mr-2">
            Show success toast
          </button>
          <button onClick={() => toastError("Failed")} className="px-3 py-2 bg-red-600 text-white rounded">
            Show error toast
          </button>
        </div>
        <div>
          <button onClick={runFlow} className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
            {loading ? <Spinner size={16} /> : null}
            Run confirm → loader → toast
          </button>
        </div>
      </div>
    </main>
  );
}