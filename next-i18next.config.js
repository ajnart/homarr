module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en',
      'de',
      'es',
      'fr',
      'it',
      'ja',
      'ko',
      'lol',
      'nl',
      'pl',
      'pt',
      'ru',
      'sl',
      'sv',
      'uk',
    ],
    fallbackLng: 'en',
    localeDetection: true,
    returnEmptyString: false,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
