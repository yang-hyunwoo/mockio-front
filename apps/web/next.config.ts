import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  output: "standalone",
  transpilePackages: ["@mockio/shared"],



};

module.exports = nextConfig;
export default nextConfig;
