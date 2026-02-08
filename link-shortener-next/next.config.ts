import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/uploads/avatars/**',
      },
        {
        protocol: 'https',
        hostname: 'a.l1s.ir',
        port: '443',
        pathname: '/api/uploads/avatars/**',
      },
        {
        protocol: 'https',
        hostname: 'l1s.ir',
        port: '443',
        pathname: '/api/uploads/avatars/**',
      },
      // اگه backendBaseUrlOrigin متغیر هست، می‌تونی اون رو هم اضافه کنی
    ],
  },
};

export default nextConfig;
