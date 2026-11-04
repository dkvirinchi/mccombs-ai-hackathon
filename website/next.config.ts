import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site. `next build` writes the HTML to /out, which Vercel serves as-is.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Vercel sets VERCEL_ENV at build time ("production", "preview" or "development").
  // Exposing it to the browser lets the form tell a PR test link from the live site (see src/lib/window.ts).
  env: { NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "" },
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
