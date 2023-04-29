const path = await import('path');

const i18nConfig = {
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
      'sk',
      'no',
    ],

    localeDetection: true,
  },
  returnEmptyString: false,
  appendNamespaceToCIMode: true,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  fallbackLng: 'en',
  localePath: path.resolve('./public/locales'),
};

export { i18nConfig };
