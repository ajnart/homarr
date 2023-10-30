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

  locale: string;
};

export const languages = [
  {
    shortName: 'de',
    originalName: 'Deutsch',
    translatedName: 'German',
    emoji: '🇩🇪',
    country: 'DE',
    locale: 'de',
  },
  {
    shortName: 'en',
    originalName: 'English',
    translatedName: 'English',
    emoji: '🇬🇧',
    country: 'GB',
    locale: 'en-gb',
  },
  // Danish
  {
    shortName: 'da',
    originalName: 'Dansk',
    translatedName: 'Danish',
    emoji: '🇩🇰',
    country: 'DK',
    locale: 'da',
  },
  // Hebrew
  {
    shortName: 'he',
    originalName: 'עברית',
    translatedName: 'Hebrew',
    emoji: '🇮🇱',
    country: 'IL',
    locale: 'he',
  },
  {
    shortName: 'es',
    originalName: 'Español',
    translatedName: 'Spanish',
    emoji: '🇪🇸',
    country: 'ES',
    locale: 'es',
  },
  {
    shortName: 'fr',
    originalName: 'Français',
    translatedName: 'French',
    emoji: '🇫🇷',
    country: 'FR',
    locale: 'fr',
  },
  {
    shortName: 'it',
    originalName: 'Italiano',
    translatedName: 'Italian',
    emoji: '🇮🇹',
    country: 'IT',
    locale: 'it',
  },
  {
    shortName: 'ja',
    originalName: '日本語',
    translatedName: 'Japanese',
    emoji: '🇯🇵',
    country: 'JP',
    locale: 'ja',
  },
  {
    shortName: 'ko',
    originalName: '한국어',
    translatedName: 'Korean',
    emoji: '🇰🇷',
    country: 'KR',
    locale: 'ko',
  },
  {
    shortName: 'lol',
    originalName: 'LOLCAT',
    translatedName: 'LOLCAT',
    emoji: '🐱',
    country: 'LOL',
    locale: 'en-gb',
  },
  // Norwegian
  {
    shortName: 'no',
    originalName: 'Norsk',
    translatedName: 'Norwegian',
    emoji: '🇳🇴',
    country: 'NO',
    locale: 'nb',
  },
  // Slovak
  {
    shortName: 'sk',
    originalName: 'Slovenčina',
    translatedName: 'Slovak',
    emoji: '🇸🇰',
    country: 'SK',
    locale: 'sk',
  },
  {
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    emoji: '🇳🇱',
    country: 'NL',
    locale: 'nl',
  },
  {
    shortName: 'pl',
    originalName: 'Polski',
    translatedName: 'Polish',
    emoji: '🇵🇱',
    country: 'PL',
    locale: 'pl',
  },
  {
    shortName: 'pt',
    originalName: 'Português',
    translatedName: 'Portuguese',
    emoji: '🇵🇹',
    country: 'PT',
    locale: 'pt',
  },
  {
    shortName: 'ru',
    originalName: 'Русский',
    translatedName: 'Russian',
    emoji: '🇷🇺',
    country: 'RU',
    locale: 'ru',
  },
  {
    shortName: 'sl',
    originalName: 'Slovenščina',
    translatedName: 'Slovenian',
    emoji: '🇸🇮',
    country: 'SI',
    locale: 'sl',
  },
  {
    shortName: 'sv',
    originalName: 'Svenska',
    translatedName: 'Swedish',
    emoji: '🇸🇪',
    country: 'SE',
    locale: 'sv',
  },
  {
    shortName: 'uk',
    originalName: 'Українська',
    translatedName: 'Ukrainian',
    emoji: '🇺🇦',
    country: 'UA',
    locale: 'uk',
  },
  // Vietnamese
  {
    shortName: 'vi',
    originalName: 'Tiếng Việt',
    translatedName: 'Vietnamese',
    emoji: '🇻🇳',
    country: 'VN',
    locale: 'vi',
  },
  // Chinese (Simplified)
  {
    shortName: 'zh',
    originalName: '中文',
    translatedName: 'Chinese (Simplified)',
    emoji: '🇨🇳',
    country: 'CN',
    locale: 'zh-cn',
  },
  // Chinese (Traditional)
  {
    shortName: 'zh-tw',
    originalName: '中文(台灣)',
    translatedName: 'Chinese (Traditional)',
    emoji: '🇹🇼',
    country: 'TW',
    locale: 'zh-tw',
  },
  {
    originalName: 'Ελληνικά',
    translatedName: 'Greek',
    emoji: '🇬🇷',
    country: 'GR',
    shortName: 'gr',
    locale: 'el',
  },
  {
    shortName: 'tr',
    originalName: 'Türkçe',
    translatedName: 'Turkish',
    emoji: '🇹🇷',
    country: 'TR',
    locale: 'tr',
  },
  {
    shortName: 'lv',
    originalName: 'Latvian',
    translatedName: 'Latvian',
    emoji: '🇱🇻',
    country: 'LV',
    locale: 'lv',
  },
  {
    shortName: 'hr',
    originalName: 'Hrvatski',
    translatedName: 'Croatian',
    emoji: '🇭🇷',
    country: 'HR',
    locale: 'hr',
  },
  // Hungarian
  {
    shortName: 'hu',
    originalName: 'Magyar',
    translatedName: 'Hungarian',
    emoji: '🇭🇺',
    country: 'HU',
    locale: 'hu',
  },
] as const satisfies Readonly<Language[]>;

export const getLanguageByCode = (code: string | null) =>
  languages.find((language) => language.shortName === code) ??
  languages.find((x) => x.locale === 'en-gb')!;
