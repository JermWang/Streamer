import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    optimizePackageImports: ["@solana/wallet-adapter-react-ui"],
  },
};

export default nextConfig;
