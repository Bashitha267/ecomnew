import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/uploads/:path*',
        destination: `${backendUrl}/api/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
