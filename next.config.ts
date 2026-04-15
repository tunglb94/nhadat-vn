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
      // VnExpress CDN
      { protocol: 'https', hostname: '*.vnecdn.net',      pathname: '/**' },
      { protocol: 'https', hostname: 'i.vnecdn.net',      pathname: '/**' },
      // Vietnamnet
      { protocol: 'https', hostname: '*.vietnamnet.vn',   pathname: '/**' },
      { protocol: 'https', hostname: 'static.vietnamnet.vn', pathname: '/**' },
      // CafeF / CafeBiz
      { protocol: 'https', hostname: '*.cafef.vn',        pathname: '/**' },
      { protocol: 'https', hostname: '*.cafebiz.vn',      pathname: '/**' },
      { protocol: 'https', hostname: 'cafefcdn.com',      pathname: '/**' },
      { protocol: 'https', hostname: '*.cafefcdn.com',    pathname: '/**' },
      // Dân Trí
      { protocol: 'https', hostname: '*.dantri.com.vn',   pathname: '/**' },
      { protocol: 'https', hostname: 'icdn.dantri.com.vn', pathname: '/**' },
      // Tuổi Trẻ
      { protocol: 'https', hostname: '*.tuoitre.vn',      pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.tuoitre.vn',    pathname: '/**' },
      // Nhịp cầu đầu tư / các báo khác
      { protocol: 'https', hostname: '*.nhipcaudautu.vn', pathname: '/**' },
      { protocol: 'https', hostname: '*.baodautu.vn',     pathname: '/**' },
      // Cho phép mọi CDN còn lại dùng wildcard (an toàn cho môi trường dev)
      { protocol: 'https', hostname: 'source.unsplash.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;