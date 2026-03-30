import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'tolczofmnknciizgytuv.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'mypnwlife.pnw.edu',
      },
    ],
  },
};

export default nextConfig;
