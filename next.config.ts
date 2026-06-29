import type { NextConfig } from "next";

// Allow the actually-configured Convex backend in CSP connect-src.
// Covers self-hosted (http/ws://127.0.0.1:3210) AND Convex Cloud, http + ws.
function convexConnectOrigins(): string[] {
  const origins = new Set<string>();
  for (const raw of [
    process.env.NEXT_PUBLIC_CONVEX_URL,
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  ]) {
    if (!raw) continue;
    try {
      const { protocol, host } = new URL(raw);
      origins.add(`${protocol}//${host}`);
      origins.add(`${protocol === "https:" ? "wss:" : "ws:"}//${host}`);
    } catch {
      // ignore malformed env values
    }
  }
  return [...origins];
}

const nextConfig: NextConfig = {
  // TEMPORARY: Ignore TS errors to restore site
  // TODO: Fix all implicit any errors and remove this
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              [
                "connect-src 'self'",
                "https://*.convex.cloud https://*.convex.site wss://*.convex.cloud",
                ...convexConnectOrigins(),
              ].join(" "),
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async redirects() {
    const exact = [
      "/standup",
      "/tasks",
      "/activity",
      "/settings",
      "/registry",
      "/dashboard-v2",
      "/mission-control",
    ].map((source) => ({ source, destination: "/", permanent: true }));
    const withSlug = [
      { source: "/tasks/:path*", destination: "/", permanent: true },
    ];
    return [...exact, ...withSlug];
  },
};

export default nextConfig;
