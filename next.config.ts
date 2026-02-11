import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '*',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
