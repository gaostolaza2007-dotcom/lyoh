/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['node:sqlite'],
  },
  async redirects() {
    return [
      {
        source: '/microbiologia',
        destination: '/agentes-infecciosos/microbiologia',
        permanent: false,
      },
      {
        source: '/microbiologia/:path*',
        destination: '/agentes-infecciosos/microbiologia/:path*',
        permanent: false,
      },
    ];
  },
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};

export default nextConfig;