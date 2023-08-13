export type Language = {
  shortName: string;
  originalName: string;
  translatedName: string;
  emoji: string;

  /**
   * The country identified b<y the ISO-3166 alpha 2 code:
   * https://www.iso.org/obp/ui/#search
   */
  country?: string;

  momentLocale: string;
};

export const languages: Language[] = [
  {
    shortName: 'de',
    originalName: 'Deutsch',
    translatedName: 'German',
    emoji: '🇩🇪',
    country: 'DE',
    momentLocale: 'de',
  },
  {
    shortName: 'en',
    originalName: 'English',
    translatedName: 'English',
    emoji: '🇬🇧',
    country: 'GB',
    momentLocale: 'en-gb',
  },
  // Danish
  {
    shortName: 'da',
    originalName: 'Dansk',
    translatedName: 'Danish',
    emoji: '🇩🇰',
    country: 'DK',
    momentLocale: 'da',
  },
  // Hebrew
  {
    shortName: 'he',
    originalName: 'עברית',
    translatedName: 'Hebrew',
    emoji: '🇮🇱',
    country: 'IL',
    momentLocale: 'he',
  },
  {
    shortName: 'es',
    originalName: 'Español',
    translatedName: 'Spanish',
    emoji: '🇪🇸',
    country: 'ES',
    momentLocale: 'es',
  },
  {
    shortName: 'fr',
    originalName: 'Français',
    translatedName: 'French',
    emoji: '🇫🇷',
    country: 'FR',
    momentLocale: 'fr',
  },
  {
    shortName: 'it',
    originalName: 'Italiano',
    translatedName: 'Italian',
    emoji: '🇮🇹',
    country: 'IT',
    momentLocale: 'it',
  },
  {
    shortName: 'ja',
    originalName: '日本語',
    translatedName: 'Japanese',
    emoji: '🇯🇵',
    country: 'JP',
    momentLocale: 'jp'
  },
  {
    shortName: 'ko',
    originalName: '한국어',
    translatedName: 'Korean',
    emoji: '🇰🇷',
    country: 'KR',
    momentLocale: 'ko'
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
    country: 'NO',
    momentLocale: 'nb',
  },
  // Slovak
  {
    shortName: 'sk',
    originalName: 'Slovenčina',
    translatedName: 'Slovak',
    emoji: '🇸🇰',
    country: 'SK',
    momentLocale: 'sk',
  },
  {
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    emoji: '🇳🇱',
    country: 'NL',
    momentLocale: 'nl',
  },
  {
    shortName: 'pl',
    originalName: 'Polski',
    translatedName: 'Polish',
    emoji: '🇵🇱',
    country: 'PL',
    momentLocale: 'pl',
  },
  {
    shortName: 'pt',
    originalName: 'Português',
    translatedName: 'Portuguese',
    emoji: '🇵🇹',
    country: 'PT',
    momentLocale: 'pt',
  },
  {
    shortName: 'ru',
    originalName: 'Русский',
    translatedName: 'Russian',
    emoji: '🇷🇺',
    country: 'RU',
    momentLocale: 'ru',
  },
  {
    momentLocale: 'si',
    shortName: 'sl',
    originalName: 'Slovenščina',
    translatedName: 'Slovenian',
    emoji: '🇸🇮',
    country: 'SI'
  },
  {
    shortName: 'sv',
    originalName: 'Svenska',
    translatedName: 'Swedish',
    emoji: '🇸🇪',
    country: 'SE',
    momentLocale: 'sv',
  },
  {
    shortName: 'uk',
    originalName: 'Українська',
    translatedName: 'Ukrainian',
    emoji: '🇺🇦',
    country: 'UA',
    momentLocale: 'uk',
  },
  // Vietnamese
  {
    shortName: 'vi',
    originalName: 'Tiếng Việt',
    translatedName: 'Vietnamese',
    emoji: '🇻🇳',
    country: 'VN',
    momentLocale: 'vi',
  },
  {
    shortName: 'zh',
    originalName: '中文',
    translatedName: 'Chinese',
    emoji: '🇨🇳',
    country: 'CN',
    momentLocale: 'cn'
  },
  {
    originalName: 'Ελληνικά',
    translatedName: 'Greek',
    emoji: '🇬🇷',
    country: 'GR',
    momentLocale: 'el',
    shortName: 'gr'
  },
  {
    shortName: 'tr',
    originalName: 'Türkçe',
    translatedName: 'Turkish',
    emoji: '🇹🇷',
    country: 'TR',
    momentLocale: 'tr',
  },
  {
    shortName: 'lv',
    originalName: 'Latvian',
    translatedName: 'Latvian',
    emoji: '🇱🇻',
    country: 'LV',
    momentLocale: 'lv',
  },
  {
    shortName: 'hr',
    originalName: 'Hrvatski',
    translatedName: 'Croatian',
    emoji: '🇭🇷',
    country: 'HR',
    momentLocale: 'hr',
  },
];

export const getLanguageByCode = (code: string | null) =>
  languages.find((language) => language.shortName === code) ?? languages[languages.length - 1];
