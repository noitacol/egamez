/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn1.epicgames.com',
      'cdn2.epicgames.com',
      'cdn.akamai.steamstatic.com',
      'steamcdn-a.akamaihd.net',
      'media.wizards.com',
      'egs-platform-product-image.s3.amazonaws.com',
      'w.forfun.com',
      'wallpapercave.com',
      'cdn.cloudflare.steamstatic.com',
      'external-preview.redd.it',
      's3.us-east-1.amazonaws.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig 