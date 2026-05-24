import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    optimizePackageImports: ["@solana/wallet-adapter-react-ui"],
  },
};

export default nextConfig;
