import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Thêm cái này cho ảnh từ database
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth avatar
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.chotot.com', // Ảnh crawl từ chotot.com
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.chotot.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;