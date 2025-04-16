/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn1.epicgames.com',
      'cdn2.epicgames.com',
      'cdn.cloudflare.steamstatic.com',
      'epic-games-api.s3.amazonaws.com',
      'epic-games-store-api-production.up.railway.app',
    ],
  },
  async headers() {
    return [
      {
        // API rotalarımız için CORS başlıklarını ayarla
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig 