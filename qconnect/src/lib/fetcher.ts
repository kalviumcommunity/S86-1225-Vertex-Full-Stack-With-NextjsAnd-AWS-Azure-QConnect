export const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch: ${res.status} ${text}`);
  }
  const body = await res.json();
  if (!body?.success) throw new Error(body?.message || "API error");
  return body.data; // return payload (e.g., { page, limit, total, data: [...] })
};
