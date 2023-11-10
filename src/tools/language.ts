export type Language = {
  shortName: string;
  originalName: string;
  translatedName: string;

  /**
   * https://www.iso.org/obp/ui/#search
   */

  locale: string;
};

export const languages = [
  {
    shortName: 'en',
    originalName: 'English',
    translatedName: 'English',
    locale: 'en-gb',
  },
  {
    shortName: 'cr',
    originalName: 'Crowdin',
    translatedName: '(Live translation)',
    locale: 'cr',
  },
  {
    shortName: 'fr',
    originalName: 'Français',
    translatedName: 'French',
    locale: 'fr',
  },
  {
    shortName: 'cn',
    originalName: '中文',
    translatedName: 'Chinese (Simplified)',
    locale: 'zh-cn',
  },
  {
    shortName: 'cs',
    originalName: 'Čeština',
    translatedName: 'Czech',
    locale: 'cs',
  },
  {
    shortName: 'da',
    originalName: 'Dansk',
    translatedName: 'Danish',
    locale: 'da',
  },
  {
    shortName: 'de',
    originalName: 'Deutsch',
    translatedName: 'German',
    locale: 'de',
  },
  {
    originalName: 'Ελληνικά',
    translatedName: 'Greek',
    shortName: 'el',
    locale: 'el',
  },
  {
    shortName: 'es',
    originalName: 'Español',
    translatedName: 'Spanish',
    locale: 'es',
  },
  {
    shortName: 'he',
    originalName: 'עברית',
    translatedName: 'Hebrew',
    locale: 'he',
  },
  {
    shortName: 'hr',
    originalName: 'Hrvatski',
    translatedName: 'Croatian',
    locale: 'hr',
  },
  {
    shortName: 'hu',
    originalName: 'Magyar',
    translatedName: 'Hungarian',
    locale: 'hu',
  },
  {
    shortName: 'it',
    originalName: 'Italiano',
    translatedName: 'Italian',
    locale: 'it',
  },
  {
    shortName: 'ja',
    originalName: '日本語',
    translatedName: 'Japanese',
    locale: 'ja',
  },
  {
    shortName: 'ko',
    originalName: '한국어',
    translatedName: 'Korean',
    locale: 'ko',
  },
  {
    shortName: 'lv',
    originalName: 'Latvian',
    translatedName: 'Latvian',
    locale: 'lv',
  },
  {
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    locale: 'nl',
  },
  {
    shortName: 'no',
    originalName: 'Norsk',
    translatedName: 'Norwegian',
    locale: 'no',
  },
  {
    shortName: 'pl',
    originalName: 'Polski',
    translatedName: 'Polish',
    locale: 'pl',
  },
  {
    shortName: 'pt',
    originalName: 'Português',
    translatedName: 'Portuguese',
    locale: 'pt',
  },
  {
    shortName: 'ru',
    originalName: 'Русский',
    translatedName: 'Russian',
    locale: 'ru',
  },
  {
    shortName: 'sk',
    originalName: 'Slovenčina',
    translatedName: 'Slovak',
    locale: 'sk',
  },
  {
    shortName: 'sl',
    originalName: 'Slovenščina',
    translatedName: 'Slovenian',
    locale: 'sl',
  },
  {
    shortName: 'sv',
    originalName: 'Svenska',
    translatedName: 'Swedish',
    locale: 'sv',
  },
  {
    shortName: 'tr',
    originalName: 'Türkçe',
    translatedName: 'Turkish',
    locale: 'tr',
  },
  {
    shortName: 'tw',
    originalName: '中文',
    translatedName: 'Chinese (Traditional)',
    locale: 'zh-tw',
  },
  {
    shortName: 'uk',
    originalName: 'Українська',
    translatedName: 'Ukrainian',
    locale: 'uk',
  },
  {
    shortName: 'vi',
    originalName: 'Tiếng Việt',
    translatedName: 'Vietnamese',
    locale: 'vi',
  },
] as const satisfies Readonly<Language[]>;

export const getLanguageByCode = (code: string | null) =>
  languages.find((language) => language.shortName === code) ??
  languages.find((x) => x.locale === 'en-gb')!;
