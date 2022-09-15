const { i18n } = require('./next-i18next.config');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const withTM = require('next-transpile-modules')(['@homarr/graphql', '@homarr/common']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.jsdelivr.net'],
  },
  reactStrictMode: false,
  output: 'standalone',
  async rewrites() {
    return [{ source: '/graphql', destination: 'http://localhost:3001/graphql' }];
  },
  i18n,
};

module.exports = buildConfig = (_phase) => {
  const plugins = [withTM, withBundleAnalyzer];
  const config = plugins.reduce((acc, plugin) => plugin(acc), {
    ...nextConfig,
  });
  return config;
};
