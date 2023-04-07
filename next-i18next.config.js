const path = require('path');

module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  i18n: {
    defaultLocale: 'en-US',
    locales: [
      'en-US', // English
      'da-DK', // Danish
      'he-IL', // Hebrew
      'de-DE', // German
      'es-ES', // Spanish
      'fr-FR', // French
      'it-IT', // Italian
      'ja-JP', // Japanese
      'ko-KR', // Korean
      'lol',
      'nl-NL', // Norwegian
      'pl-PL', // Polish
      'pt-PT', // Portugese
      'ru-RU', // Russian
      'sl-SL', // Slovenian
      'sv-SE', // Swedish
      'vi-VN', // Vietnamese
      'uk-UA', // Ukranian
      'zh-CN', // Chinese (Simplified)
      'el-GR', // Greek
      'sk-SK', // Slovak
      'no-NO', // Norvegian
    ],

    localeDetection: true,
  },
  returnEmptyString: false,
  appendNamespaceToCIMode: true,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  fallbackLng: 'en-US',
  localePath: path.resolve('./public/locales'),
};
