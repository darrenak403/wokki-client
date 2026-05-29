import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      // Legacy paths without org/branch — canonical URLs handled in proxy.ts (JWT + branch cookie).
    ];
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
