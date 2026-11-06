import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Only globals.css uses Tailwind. A "*.css" glob here would also match
      // *.module.css, and `as: "*.css"` would turn CSS Modules into plain
      // global CSS (class names come back undefined).
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
