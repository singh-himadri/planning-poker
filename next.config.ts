import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Ensure we don't have issues with strict mode for socket double connect
  reactStrictMode: false,
};

export default nextConfig;
