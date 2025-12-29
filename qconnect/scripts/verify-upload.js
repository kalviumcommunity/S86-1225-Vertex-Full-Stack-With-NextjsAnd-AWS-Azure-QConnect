// Usage: node scripts/verify-upload.js https://your-bucket.s3.region.amazonaws.com/uploads/.../file.jpg
const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/verify-upload.js <publicUrl>');
  process.exit(1);
}

(async () => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`HEAD ${url} -> status ${res.status}`);
    if (res.ok) console.log('File exists and is accessible');
    else console.log('File not found or not publicly accessible (status ' + res.status + ')');
  } catch (err) {
    console.error('Failed to verify upload:', err.message || err);
    process.exit(2);
  }
})();