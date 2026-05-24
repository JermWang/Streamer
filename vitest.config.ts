import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    // Exclude tests that require browser-specific Solana packages
    exclude: [
      "**/node_modules/**",
      "**/auth.test.ts", // requires @solana/web3.js which needs browser env
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
