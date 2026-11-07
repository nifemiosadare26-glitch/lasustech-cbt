import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/public/exam/:path*",
        destination: "/exam/:path*",
      },
    ];
  },
};

export default nextConfig;
