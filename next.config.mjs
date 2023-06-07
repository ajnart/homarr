const { i18n } = await import('./next-i18next.config.js');

const { default: configreBundleAnalyser } = await import('@next/bundle-analyzer');

const withBundleAnalyzer = configreBundleAnalyser({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  images: {
    domains: ['cdn.jsdelivr.net'],
  },
  reactStrictMode: true,
  output: 'standalone',
  i18n,
  transpilePackages: ['@jellyfin/sdk'],
});
