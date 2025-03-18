import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    // configure to ignore next.js image config including safety
    loader: "custom",
    unoptimized: true,
  },
};

export default nextConfig;
