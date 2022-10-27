const { env } = require('process');

const { i18n } = require('./next-i18next.config');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  images: {
    domains: ['cdn.jsdelivr.net'],
  },
  reactStrictMode: false,
  output: 'standalone',
  i18n,
});
