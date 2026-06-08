import type { NextConfig } from "next";
import config from "@/config";

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
        hostname: `${new URL(config.frontBaseUrl).hostname}`,
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
