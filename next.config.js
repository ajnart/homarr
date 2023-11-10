require('./src/env');
const { i18n } = require('./next-i18next.config');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  images: {
    domains: ['cdn.jsdelivr.net'],
  },
  reactStrictMode: true,
  output: 'standalone',
  i18n,
  transpilePackages: ['@jellyfin/sdk'],
  redirects: async () => [
    {
      source: '/',
      destination: '/board',
      permanent: false,
    },
  ],
  env: {
    NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL || process.env.HOSTNAME || 'http://localhost:3000'
  },
});
