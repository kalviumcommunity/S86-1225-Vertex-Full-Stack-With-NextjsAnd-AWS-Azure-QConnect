"use client";
import { useState } from "react";

export default function UploadDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB client-side guard

  const validate = (f: File) => {
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      setStatus("Only images (png/jpg) and PDFs are allowed.");
      return false;
    }
    if (f.size > MAX_UPLOAD_SIZE) {
      setStatus("File too large. Max 10MB.");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!file) return setStatus("Please select a file first.");
    setStatus("Requesting upload URL...");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, fileType: file.type, size: file.size }),
      });

      const payload = await res.json();
      if (!payload.success) return setStatus(`Failed to get upload URL: ${payload.message || "unknown"}`);

      setStatus("Uploading file to storage...");
      const upload = payload.upload;

      const putRes = await fetch(upload.uploadURL, { method: upload.method, body: file, headers: { "Content-Type": file.type } });
      if (!putRes.ok) return setStatus(`Upload failed with status ${putRes.status}`);

      setStatus("Saving file metadata in the app...");
      const saveRes = await fetch("/api/files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, fileURL: upload.publicUrl, size: file.size, mime: file.type }) });
      const savePayload = await saveRes.json();
      if (!savePayload.success) return setStatus(`Failed to save metadata: ${savePayload.message || "unknown"}`);

      setPublicUrl(upload.publicUrl);
      setStatus("Upload complete!");
    } catch (err: any) {
      setStatus(`Error: ${err.message || String(err)}`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Presigned Upload Demo</h2>
      <p className="text-sm text-gray-600">Select an image or PDF and upload directly to cloud storage using a presigned URL.</p>

      <div className="mt-3">
        <input type="file" onChange={(e) => { const f = e.target.files?.[0] || null; if (f && validate(f)) { setFile(f); setStatus(null); } else { setFile(null); } }} />
      </div>

      <div className="mt-3 flex gap-2">
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={handleUpload} disabled={!file}>Upload</button>
      </div>

      {status && <p className="mt-3 text-sm">{status}</p>}

      {publicUrl && (
        <div className="mt-3">
          <h4 className="font-medium">File available at:</h4>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">{publicUrl}</a>
        </div>
      )}
    </div>
  );
}