export type Language = {
  shortName: string;
  originalName: string;
  translatedName: string;
  emoji: string;
  momentLocale: string;
};

export const languages: Language[] = [
  {
    shortName: 'de',
    originalName: 'Deutsch',
    translatedName: 'German',
    emoji: '🇩🇪',
    momentLocale: 'de',
  },
  {
    shortName: 'en',
    originalName: 'English',
    translatedName: 'English',
    emoji: '🇬🇧',
    momentLocale: 'en-gb',
  },
  // Danish
  {
    shortName: 'da',
    originalName: 'Dansk',
    translatedName: 'Danish',
    emoji: '🇩🇰',
    momentLocale: 'da',
  },
  // Hebrew
  {
    shortName: 'he',
    originalName: 'עברית',
    translatedName: 'Hebrew',
    emoji: '🇮🇱',
    momentLocale: 'he',
  },
  {
    shortName: 'es',
    originalName: 'Español',
    translatedName: 'Spanish',
    emoji: '🇪🇸',
    momentLocale: 'es',
  },
  {
    shortName: 'fr',
    originalName: 'Français',
    translatedName: 'French',
    emoji: '🇫🇷',
    momentLocale: 'fr',
  },
  {
    shortName: 'it',
    originalName: 'Italiano',
    translatedName: 'Italian',
    emoji: '🇮🇹',
    momentLocale: 'it',
  },
  {
    shortName: 'ja',
    originalName: '日本語',
    translatedName: 'Japanese',
    emoji: '🇯🇵',
    momentLocale: 'ja',
  },
  {
    shortName: 'ko',
    originalName: '한국어',
    translatedName: 'Korean',
    emoji: '🇰🇷',
    momentLocale: 'ko',
  },
  {
    shortName: 'lol',
    originalName: 'LOLCAT',
    translatedName: 'LOLCAT',
    emoji: '🐱',
    momentLocale: 'en-gb',
  },
  // Norwegian
  {
    shortName: 'no',
    originalName: 'Norsk',
    translatedName: 'Norwegian',
    emoji: '🇳🇴',
    momentLocale: 'nb',
  },
  // Slovak
  {
    shortName: 'sk',
    originalName: 'Slovenčina',
    translatedName: 'Slovak',
    emoji: '🇸🇰',
    momentLocale: 'sk',
  },
  {
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    emoji: '🇳🇱',
    momentLocale: 'nl',
  },
  {
    shortName: 'pl',
    originalName: 'Polski',
    translatedName: 'Polish',
    emoji: '🇵🇱',
    momentLocale: 'pl',
  },
  {
    shortName: 'pt',
    originalName: 'Português',
    translatedName: 'Portuguese',
    emoji: '🇵🇹',
    momentLocale: 'pt',
  },
  {
    shortName: 'ru',
    originalName: 'Русский',
    translatedName: 'Russian',
    emoji: '🇷🇺',
    momentLocale: 'ru',
  },
  {
    shortName: 'sl',
    originalName: 'Slovenščina',
    translatedName: 'Slovenian',
    emoji: '🇸🇮',
    momentLocale: 'sl',
  },

  {
    shortName: 'sv',
    originalName: 'Svenska',
    translatedName: 'Swedish',
    emoji: '🇸🇪',
    momentLocale: 'sv',
  },
  {
    shortName: 'uk',
    originalName: 'Українська',
    translatedName: 'Ukrainian',
    emoji: '🇺🇦',
    momentLocale: 'uk',
  },
  // Vietnamese
  {
    shortName: 'vi',
    originalName: 'Tiếng Việt',
    translatedName: 'Vietnamese',
    emoji: '🇻🇳',
    momentLocale: 'vi',
  },
  {
    shortName: 'zh',
    originalName: '中文',
    translatedName: 'Chinese',
    emoji: '🇨🇳',
    momentLocale: 'zh-cn',
  },
  {
    shortName: 'el',
    originalName: 'Ελληνικά',
    translatedName: 'Greek',
    emoji: '🇬🇷',
    momentLocale: 'el',
  },
  {
    shortName: 'tr',
    originalName: 'Türkçe',
    translatedName: 'Turkish',
    emoji: '🇹🇷',
    momentLocale: 'tr',
  },
  {
    shortName: 'lv',
    originalName: 'Latvian',
    translatedName: 'Latvian',
    emoji: '🇱🇻',
    momentLocale: 'lv',
  },
  {
    shortName: 'hr',
    originalName: 'Hrvatski',
    translatedName: 'Croatian',
    emoji: '🇭🇷',
    momentLocale: 'hr',
  },
];

export const getLanguageByCode = (code: string | null) =>
  languages.find((language) => language.shortName === code) ?? languages[languages.length - 1];
