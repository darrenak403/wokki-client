import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      // Legacy paths without org/branch — canonical URLs handled in proxy.ts (JWT + branch cookie).
    ];
  },
  // Same-origin /api/* proxy lives in proxy.ts (Next middleware), not here:
  // for output:"standalone", rewrites() destinations are frozen at build time
  // and never see the container's real runtime env var.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
    ],
  },
};

export default nextConfig;
