import i18n from 'i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const loadI18n = () => {
  i18n
    .use(LanguageDetector)
    .use(Backend)
    .init({
      fallbackLng: ['de-de', 'en-us'],
      supportedLngs: ['en-us', 'de-de'],
      lowerCaseLng: true,
      keySeparator: '.',
      backend: {
        loadPath: constructLoadPath,
      },
      debug: true,
    });
  return i18n;
};

export const convertCodeToName = (code: string) => {
  switch (code) {
    case 'en-us':
      return 'English (US)';
    case 'de-de':
      return 'German';
    default:
      return `Unknown (${code})`;
  }
};

const constructLoadPath = () => {
  return '/locales/{{lng}}.json';
};
