import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const csp = process.env.CSP_DIRECTIVES || "default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';";

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
];

if (isProduction || process.env.ENABLE_HSTS === 'true') {
  securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' });
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
