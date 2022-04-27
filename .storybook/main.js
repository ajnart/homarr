module.exports = {
  stories: ['../**/*.story.mdx', '../**/*.story.*'],
  addons: [
    'storybook-dark-mode',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: 'storybook-addon-turbo-build',
      options: { optimizationLevel: 2 },
    },
  ],
  typescript: {
    check: false,
    reactDocgen: false,
  },
  framework: '@storybook/react',
  features: { emotionAlias: false },
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // https://github.com/polkadot-js/extension/issues/621#issuecomment-759341776
    // framer-motion uses the .mjs notation and we need to include it so that webpack will
    // transpile it for us correctly (enables using a CJS module inside an ESM).
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });
    // Return the altered config
    return config;
  },
};
