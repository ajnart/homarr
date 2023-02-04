const path = require('path');

module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en',
      'da',
      'he',
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
      'vi',
      'uk',
      'zh',
      'el',
    ],
    localePath: path.resolve('./public/locales'),
    fallbackLng: 'en',
    localeDetection: true,
    returnEmptyString: false,
    debug: process.env.NODE_ENV === 'development',
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
