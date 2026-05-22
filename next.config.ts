import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [{ source: "/home", destination: "/", permanent: true }];
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
