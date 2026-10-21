import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site. `next build` writes the HTML to /out, which Vercel serves as-is.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
