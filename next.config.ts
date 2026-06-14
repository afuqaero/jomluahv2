import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake phosphor-icons automatically — huge icon library, many unused exports.
    // This cuts the JS bundle per page and speeds up both dev compilation and production.
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
