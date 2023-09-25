const path = require('path');

const HttpApi = require('i18next-http-backend').default
const ChainedBackend = require('i18next-chained-backend').default
const LocalStorageBackend = require('i18next-localstorage-backend').default

const isBrowser = typeof window !== 'undefined'

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
      'sk',
      'no',
      'tr',
      'lv',
      'hr',
      'hu'
    ],

    localeDetection: true,
  },
  backend: {
    backends: isBrowser ? [LocalStorageBackend, HttpApi] : [],
    backendOptions: [
      {
        // prefix for stored languages
        prefix: 'i18next_res_',

        // expiration
        expirationTime: 7 * 24 * 60 * 60 * 1000,

        // can be either window.localStorage or window.sessionStorage. Default: window.localStorage
        store: typeof window !== 'undefined' ? window.localStorage : null,
      },
      {
        /* options for secondary backend */
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
    ],
  },
  bindI18n: 'languageChanged loaded',
  serializeConfig: false,
  use: isBrowser ? [ChainedBackend] : [],
  returnEmptyString: false,
  appendNamespaceToCIMode: true,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  fallbackLng: 'en',
  localePath: path.resolve('./public/locales'),
};
