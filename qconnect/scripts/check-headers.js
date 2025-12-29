// Usage: node scripts/check-headers.js http://localhost:3000
const url = process.argv[2] || "http://localhost:3000";

(async () => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`URL: ${url} (status: ${res.status})`);
    console.log('Response headers:');
    for (const [k, v] of res.headers.entries()) {
      if (["content-security-policy", "strict-transport-security", "x-frame-options", "x-content-type-options", "access-control-allow-origin"].includes(k)) {
        console.log(`${k}: ${v}`);
      }
    }
  } catch (err) {
    console.error('Failed to fetch headers:', err.message || err);
    process.exit(1);
  }
})();