module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'ru', 'sl', 'sv', 'zh'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
