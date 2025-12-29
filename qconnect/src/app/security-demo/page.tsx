"use client";
import { useState } from "react";

export default function SecurityDemoPage() {
  const [text, setText] = useState("<script>alert('bad')</script> Hello <b>bold</b>");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const res = await fetch("/api/security/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Sanitization Demo</h2>
      <p className="text-sm text-gray-600">Enter text with scripts or SQL-like payloads to see before/after sanitization</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-32 border rounded mt-3 p-2" />
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={run} disabled={loading}>{loading ? "Running…" : "Run"}</button>
      </div>

      {result && (
        <div className="mt-4">
          <h3 className="font-medium">Before</h3>
          <pre className="bg-gray-100 rounded p-2">{result.data.before}</pre>

          <h3 className="font-medium mt-2">After (no HTML allowed)</h3>
          <pre className="bg-gray-100 rounded p-2">{result.data.after}</pre>

          <h3 className="font-medium mt-2">After (limited HTML allowed)</h3>
          <div className="bg-white rounded p-2 border" dangerouslySetInnerHTML={{ __html: result.data.allowedHtml }} />
        </div>
      )}
    </div>
  );
}
