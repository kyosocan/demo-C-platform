/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/demo-C-platform' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/demo-C-platform' : '',
  images: {
    unoptimized: true,
    domains: ['picsum.photos', 'images.unsplash.com'],
  },
  trailingSlash: true,
}

module.exports = nextConfig
