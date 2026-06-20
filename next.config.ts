import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      // Legacy paths without org/branch — canonical URLs handled in proxy.ts (JWT + branch cookie).
    ];
  },
  async rewrites() {
    // Same-origin proxy: browser calls /api/* on the FE domain; Next.js forwards
    // server-side to the backend so DevTools never reveals the backend's own domain.
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8386").replace(
      /\/+$/,
      ""
    );
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
    ],
  },
};

export default nextConfig;
