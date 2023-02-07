const { i18n } = require('./next-i18next.config');

const removeImports = require('next-remove-imports')();

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(
  removeImports({
    experimental: { esmExternals: true },
    images: {
      domains: ['cdn.jsdelivr.net'],
    },
    reactStrictMode: true,
    output: 'standalone',
    i18n,
  })
);
