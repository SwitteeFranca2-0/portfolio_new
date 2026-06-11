import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'franca-uvere.vercel.app' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'supabase-storage-production.up.railway.app' },
    ],
  },
};

export default nextConfig;
