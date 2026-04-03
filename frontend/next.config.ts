import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'd49d07e7-1bcb-4737-a8df-3fc548778cda.cluster-0.preview.emergentcf.cloud',
    'd49d07e7-1bcb-4737-a8df-3fc548778cda.cluster-5.preview.emergentcf.cloud',
    'ataka-demo.cluster-0.preview.emergentcf.cloud',
    'ataka-demo.cluster-5.preview.emergentcf.cloud',
    'd49d07e7-1bcb-4737-a8df-3fc548778cda.preview.emergentagent.com',
    'b092756e-b197-4f33-9cec-81dfc8f48cc3.preview.emergentagent.com',
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
