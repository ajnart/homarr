export type Language = {
  shortName: string;
  originalName: string;
  translatedName: string;

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
    country: 'DE',
    locale: 'de',
  },
  {
    shortName: 'en',
    originalName: 'English',
    translatedName: 'English',
    country: 'GB',
    locale: 'en-gb',
  },
  // Danish
  {
    shortName: 'da',
    originalName: 'Dansk',
    translatedName: 'Danish',
    country: 'DK',
    locale: 'da',
  },
  // Hebrew
  {
    shortName: 'he',
    originalName: 'עברית',
    translatedName: 'Hebrew',
    country: 'IL',
    locale: 'he',
  },
  {
    shortName: 'es',
    originalName: 'Español',
    translatedName: 'Spanish',
    country: 'ES',
    locale: 'es',
  },
  {
    shortName: 'fr',
    originalName: 'Français',
    translatedName: 'French',
    country: 'FR',
    locale: 'fr',
  },
  {
    shortName: 'it',
    originalName: 'Italiano',
    translatedName: 'Italian',
    country: 'IT',
    locale: 'it',
  },
  {
    shortName: 'ja',
    originalName: '日本語',
    translatedName: 'Japanese',
    country: 'JP',
    locale: 'ja',
  },
  {
    shortName: 'ko',
    originalName: '한국어',
    translatedName: 'Korean',
    country: 'KR',
    locale: 'ko',
  },
  // Norwegian
  {
    shortName: 'no',
    originalName: 'Norsk',
    translatedName: 'Norwegian',
    country: 'NO',
    locale: 'nb',
  },
  // Slovak
  {
    shortName: 'sk',
    originalName: 'Slovenčina',
    translatedName: 'Slovak',
    country: 'SK',
    locale: 'sk',
  },
  {
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    country: 'NL',
    locale: 'nl',
  },
  {
    shortName: 'pl',
    originalName: 'Polski',
    translatedName: 'Polish',
    country: 'PL',
    locale: 'pl',
  },
  {
    shortName: 'pt',
    originalName: 'Português',
    translatedName: 'Portuguese',
    country: 'PT',
    locale: 'pt',
  },
  {
    shortName: 'ru',
    originalName: 'Русский',
    translatedName: 'Russian',
    country: 'RU',
    locale: 'ru',
  },
  {
    shortName: 'sl',
    originalName: 'Slovenščina',
    translatedName: 'Slovenian',
    country: 'SI',
    locale: 'sl',
  },
  {
    shortName: 'sv',
    originalName: 'Svenska',
    translatedName: 'Swedish',
    country: 'SE',
    locale: 'sv',
  },
  {
    shortName: 'uk',
    originalName: 'Українська',
    translatedName: 'Ukrainian',
    country: 'UA',
    locale: 'uk',
  },
  // Vietnamese
  {
    shortName: 'vi',
    originalName: 'Tiếng Việt',
    translatedName: 'Vietnamese',
    country: 'VN',
    locale: 'vi',
  },
  // Chinese (Simplified)
  {
    shortName: 'cn',
    originalName: '中文',
    translatedName: 'Chinese (Simplified)',
    country: 'CN',
    locale: 'zh-cn',
  },
  // Chinese (Traditional)
  {
    shortName: 'tw',
    originalName: '中文(台灣)',
    translatedName: 'Chinese (Traditional)',
    emoji: '🇹🇼',
    country: 'TW',
    locale: 'zh-tw',
  },
  {
    originalName: 'Ελληνικά',
    translatedName: 'Greek',
    country: 'GR',
    shortName: 'gr',
    locale: 'el',
  },
  {
    shortName: 'tr',
    originalName: 'Türkçe',
    translatedName: 'Turkish',
    country: 'TR',
    locale: 'tr',
  },
  {
    shortName: 'lv',
    originalName: 'Latvian',
    translatedName: 'Latvian',
    country: 'LV',
    locale: 'lv',
  },
  {
    shortName: 'hr',
    originalName: 'Hrvatski',
    translatedName: 'Croatian',
    country: 'HR',
    locale: 'hr',
  },
  // Hungarian
  {
    shortName: 'hu',
    originalName: 'Magyar',
    translatedName: 'Hungarian',
    country: 'HU',
    locale: 'hu',
  },
  // Crowdin Live translate
  {
    shortName: 'cr',
    originalName: 'Crowdin',
    translatedName: '(Live translation)',
    country: 'CROWDIN',
    locale: 'cr',
  },
] as const satisfies Readonly<Language[]>;

export const getLanguageByCode = (code: string | null) =>
  languages.find((language) => language.shortName === code) ??
  languages.find((x) => x.locale === 'en-gb')!;
