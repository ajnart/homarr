const path = require('path');

module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  i18n: {
    defaultLocale: 'en',
    locales: [
      'ar',
      'cn',
      'cr',
      'cs',
      'da',
      'de',
      'el',
      'en',
      'es',
      'fr',
      'he',
      'hr',
      'hu',
      'it',
      'ja',
      'ko',
      'lv',
      'nl',
      'no',
      'pl',
      'pt',
      'ru',
      'sk',
      'sl',
      'sv',
      'tr',
      'tw',
      'uk',
      'vi',
      'et',
      'lt',
      'ro'
    ],

    localeDetection: false,
  },
  returnEmptyString: false,
  appendNamespaceToCIMode: true,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  fallbackLng: 'en',
  localePath: path.resolve('./public/locales'),
};
