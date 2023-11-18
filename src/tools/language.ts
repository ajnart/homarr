export type Language = {
  shortName: string;
  originalName: string;
  translatedName: string;

  /**
   * https://www.iso.org/obp/ui/#search
   */
  country: string;
  locale: string;
};

export const languages = [
  {
    shortName: 'en',
    originalName: 'English',
    translatedName: 'English',
    country: 'GB',
    locale: 'en-gb',
  },
  {
    shortName: 'cr',
    originalName: 'Crowdin',
    translatedName: '(Live translation)',
    locale: 'cr',
    country: 'CROWDIN',
  },
  {
    shortName: 'fr',
    originalName: 'Français',
    translatedName: 'French',
    country: 'FR',
    locale: 'fr',
  },
  {
    shortName: 'cn',
    originalName: '中文',
    translatedName: 'Chinese (Simplified)',
    country: 'CN',
    locale: 'zh-cn',
  },
  {
    shortName: 'cs',
    originalName: 'Čeština',
    translatedName: 'Czech',
    country: 'CZ',
    locale: 'cs',
  },
  {
    shortName: 'da',
    originalName: 'Dansk',
    translatedName: 'Danish',
    country: 'DK',
    locale: 'da',
  },
  {
    shortName: 'de',
    originalName: 'Deutsch',
    translatedName: 'German',
    country: 'DE',
    locale: 'de',
  },
  {
    shortName: 'el',
    originalName: 'Ελληνικά',
    translatedName: 'Greek',
    country: 'GR',
    locale: 'el',
  },
  {
    shortName: 'es',
    originalName: 'Español',
    translatedName: 'Spanish',
    country: 'ES',
    locale: 'es',
  },
  {
    shortName: 'he',
    originalName: 'עברית',
    translatedName: 'Hebrew',
    country: 'IL',
    locale: 'he',
  },
  {
    shortName: 'hr',
    originalName: 'Hrvatski',
    translatedName: 'Croatian',
    country: 'HR',
    locale: 'hr',
  },
  {
    shortName: 'hu',
    originalName: 'Magyar',
    translatedName: 'Hungarian',
    country: 'HU',
    locale: 'hu',
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
  {
    shortName: 'lv',
    originalName: 'Latvian',
    translatedName: 'Latvian',
    country: 'LV',
    locale: 'lv',
  },
  {
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    country: 'NL',
    locale: 'nl',
  },
  {
    shortName: 'no',
    originalName: 'Norsk',
    translatedName: 'Norwegian',
    country: 'NO',
    locale: 'no',
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
    shortName: 'sk',
    originalName: 'Slovenčina',
    translatedName: 'Slovak',
    country: 'SK',
    locale: 'sk',
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
    shortName: 'tr',
    originalName: 'Türkçe',
    translatedName: 'Turkish',
    country: 'TR',
    locale: 'tr',
  },
  {
    shortName: 'tw',
    originalName: '中文',
    translatedName: 'Chinese (Traditional)',
    country: 'TW',
    locale: 'zh-tw',
  },
  {
    shortName: 'uk',
    originalName: 'Українська',
    translatedName: 'Ukrainian',
    country: 'UA',
    locale: 'uk',
  },
  {
    shortName: 'vi',
    originalName: 'Tiếng Việt',
    translatedName: 'Vietnamese',
    country: 'VN',
    locale: 'vi',
  },
] as const satisfies Readonly<Language[]>;

export const getLanguageByCode = (code: string | null) =>
  languages.find((language) => language.shortName === code) ??
  languages.find((x) => x.locale === 'en-gb')!;
