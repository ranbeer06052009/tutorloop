import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages talk to Mongo and Gemma at request time; skip static prerender traps on Render.
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
