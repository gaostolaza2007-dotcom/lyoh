/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverComponentsExternalPackages: ['node:sqlite'],
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};

export default nextConfig;