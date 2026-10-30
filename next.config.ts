import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Neon's env export has no NEXT_PUBLIC_ variant; the realtime endpoint is meant for browsers (the secret stays server-only).
  env: { NEXT_PUBLIC_NEON_REALTIME_URL: process.env.NEON_REALTIME_URL ?? "" },
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  async redirects() {
    // Sign-in and sign-up were merged: the emailed link does both.
    return [
      { source: "/auth/sign-in", destination: "/auth", permanent: false },
      { source: "/auth/sign-up", destination: "/auth", permanent: false },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Shared pages: never indexed, never leak the capability URL via Referer.
        source: "/s/:token*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
