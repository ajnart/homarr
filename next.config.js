const { env } = require('process');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: false,
  experimental: {
    outputStandalone: true,
  },
  output: 'standalone',
});
