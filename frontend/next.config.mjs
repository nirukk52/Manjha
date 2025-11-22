/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  // Disable ESLint during production builds (linting handled separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
