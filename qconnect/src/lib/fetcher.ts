export const fetcher = async (url: string) => {
  let res = await fetch(url, { credentials: "same-origin" });

  // If unauthorized, try to refresh once
  if (res.status === 401) {
    const refresh = await fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" });
    if (refresh.ok) {
      res = await fetch(url, { credentials: "same-origin" });
    } else {
      const txt = await refresh.text();
      throw new Error(`Refresh failed: ${refresh.status} ${txt}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch: ${res.status} ${text}`);
  }
  const body = await res.json();
  if (!body?.success) throw new Error(body?.message || "API error");
  return body.data; // return payload (e.g., { page, limit, total, data: [...] })
};
