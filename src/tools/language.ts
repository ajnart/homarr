export type Language = {
  shortName: string;
  originalName: string;
  translatedName: string;

  /**
   * https://www.iso.org/obp/ui/#search
   */
  country: string;
  locale: string;

  /**
   *
   */
  dayJsLocale?: string;
};

export const languages = [
    {
    shortName: 'ar',
    originalName: 'العربية',
    translatedName: 'Arabic',
    country: 'BH',
    locale: 'ar-bh',
    dayJsLocale: 'ar'
  },
  {
    shortName: 'en',
    originalName: 'English',
    translatedName: 'English',
    country: 'GB',
    locale: 'en-gb',
    dayJsLocale: 'en'
  },
  {
    shortName: 'cr',
    originalName: 'Crowdin',
    translatedName: '(Live translation)',
    locale: 'cr',
    country: 'CROWDIN'
  },
  {
    shortName: 'fr',
    originalName: 'Français',
    translatedName: 'French',
    country: 'FR',
    locale: 'fr',
    dayJsLocale: 'fr'
  },
  {
    shortName: 'cn',
    originalName: '中文',
    translatedName: 'Chinese (Simplified)',
    country: 'CN',
    locale: 'zh-cn',
    dayJsLocale: 'zh'
  },
  {
    shortName: 'cs',
    originalName: 'Čeština',
    translatedName: 'Czech',
    country: 'CZ',
    locale: 'cs',
    dayJsLocale: 'cs'
  },
  {
    shortName: 'da',
    originalName: 'Dansk',
    translatedName: 'Danish',
    country: 'DK',
    locale: 'da',
    dayJsLocale: 'da'
  },
  {
    shortName: 'de',
    originalName: 'Deutsch',
    translatedName: 'German',
    country: 'DE',
    locale: 'de',
    dayJsLocale: 'de'
  },
  {
    shortName: 'el',
    originalName: 'Ελληνικά',
    translatedName: 'Greek',
    country: 'GR',
    locale: 'el',
    dayJsLocale: 'el'
  },
  {
    shortName: 'es',
    originalName: 'Español',
    translatedName: 'Spanish',
    country: 'ES',
    locale: 'es',
    dayJsLocale: 'es'
  },
  {
    shortName: 'he',
    originalName: 'עברית',
    translatedName: 'Hebrew',
    country: 'IL',
    locale: 'he',
    dayJsLocale: 'he'
  },
  {
    shortName: 'hr',
    originalName: 'Hrvatski',
    translatedName: 'Croatian',
    country: 'HR',
    locale: 'hr',
    dayJsLocale: 'hr'
  },
  {
    shortName: 'hu',
    originalName: 'Magyar',
    translatedName: 'Hungarian',
    country: 'HU',
    locale: 'hu',
    dayJsLocale: 'hu'
  },
  {
    shortName: 'it',
    originalName: 'Italiano',
    translatedName: 'Italian',
    country: 'IT',
    locale: 'it',
    dayJsLocale: 'it'
  },
  {
    shortName: 'ja',
    originalName: '日本語',
    translatedName: 'Japanese',
    country: 'JP',
    locale: 'ja',
    dayJsLocale: 'ja'
  },
  {
    shortName: 'ko',
    originalName: '한국어',
    translatedName: 'Korean',
    country: 'KR',
    locale: 'ko',
    dayJsLocale: 'ko'
  },
  {
    shortName: 'lv',
    originalName: 'Latvian',
    translatedName: 'Latvian',
    country: 'LV',
    locale: 'lv',
    dayJsLocale: 'lv'
  },
  {
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    country: 'NL',
    locale: 'nl',
    dayJsLocale: 'nl'
  },
  {
    shortName: 'no',
    originalName: 'Norsk',
    translatedName: 'Norwegian',
    country: 'NO',
    locale: 'no',
    dayJsLocale: 'nb'
  },
  {
    shortName: 'pl',
    originalName: 'Polski',
    translatedName: 'Polish',
    country: 'PL',
    locale: 'pl',
    dayJsLocale: 'pl'
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
    dayJsLocale: 'ru'
  },
  {
    shortName: 'sk',
    originalName: 'Slovenčina',
    translatedName: 'Slovak',
    country: 'SK',
    locale: 'sk',
    dayJsLocale: 'sk'
  },
  {
    shortName: 'sl',
    originalName: 'Slovenščina',
    translatedName: 'Slovenian',
    country: 'SI',
    locale: 'sl',
    dayJsLocale: 'sl'
  },
  {
    shortName: 'sv',
    originalName: 'Svenska',
    translatedName: 'Swedish',
    country: 'SE',
    locale: 'sv',
    dayJsLocale: 'sv'
  },
  {
    shortName: 'tr',
    originalName: 'Türkçe',
    translatedName: 'Turkish',
    country: 'TR',
    locale: 'tr',
    dayJsLocale: 'tr'
  },
  {
    shortName: 'tw',
    originalName: '中文',
    translatedName: 'Chinese (Traditional)',
    country: 'TW',
    locale: 'zh-tw',
    dayJsLocale: 'zh-cn'
  },
  {
    shortName: 'uk',
    originalName: 'Українська',
    translatedName: 'Ukrainian',
    country: 'UA',
    locale: 'uk',
    dayJsLocale: 'uk'
  },
  {
    shortName: 'vi',
    originalName: 'Tiếng Việt',
    translatedName: 'Vietnamese',
    country: 'VN',
    locale: 'vi',
    dayJsLocale: 'vi'
  },
  {
    shortName: 'et',
    originalName: 'Eesti',
    translatedName: 'Estonian',
    country: 'EE',
    locale: 'et',
    dayJsLocale: 'et'
  },
  // Lithuanian
  {
    shortName: 'lt',
    originalName: 'Lietuvių',
    translatedName: 'Lithuanian',
    country: 'LT',
    locale: 'lt',
    dayJsLocale: 'lt'
  },
  {
    shortName: 'ro',
    originalName: 'Românesc',
    translatedName: 'Romanian',
    country: 'RO',
    locale: 'ro',
    dayJsLocale: 'ro'
  }
] as const satisfies Readonly<Language[]>;

export const getLanguageByCode = (code: string | null): Language =>
  languages.find((language) => language.shortName === code) ??
  languages.find((x) => x.locale === 'en-gb')!;
