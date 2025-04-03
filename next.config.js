/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  images: {
    domains: [],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  serverOptions: {
    port: 3456
  }
}

module.exports = nextConfig 