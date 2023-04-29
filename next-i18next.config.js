const path = require('path');

const i18n = {
  defaultLocale: 'en',
  interpolation: {
    skipOnVariables: false,
  },
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
    'sk',
    'no',
  ],

  localeDetection: true,
};

module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  i18n,
  returnEmptyString: false,
  appendNamespaceToCIMode: true,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  fallbackLng: 'en',
  localePath: path.resolve('./public/locales'),
};
