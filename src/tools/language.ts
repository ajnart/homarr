export class Language {
  shortName: string;
  originalName: string;
  translatedName: string;
  emoji: string;

  /**
   * The country identified b<y the ISO-3166 alpha 2 code:
   * https://www.iso.org/obp/ui/#search
   */
  country?: string;

  constructor(shortName: string, originalName: string, translatedName: string, emoji: string, country: string) {
    this.shortName = shortName;
    this.originalName = originalName;
    this.translatedName = translatedName;
    this.emoji = emoji;
    this.country = country;
  }
}

export const languages: Language[] = [
  {
    shortName: 'de',
    originalName: 'Deutsch',
    translatedName: 'German',
    emoji: '🇩🇪',
    country: 'DE'
  },
  {
    shortName: 'en',
    originalName: 'English',
    translatedName: 'English',
    emoji: '🇬🇧',
    country: 'GB'
  },
  // Danish
  {
    shortName: 'da',
    originalName: 'Dansk',
    translatedName: 'Danish',
    emoji: '🇩🇰',
    country: 'DK'
  },
  // Hebrew
  {
    shortName: 'he',
    originalName: 'עברית',
    translatedName: 'Hebrew',
    emoji: '🇮🇱',
    country: 'IL'
  },
  {
    shortName: 'es',
    originalName: 'Español',
    translatedName: 'Spanish',
    emoji: '🇪🇸',
    country: 'ES'
  },
  {
    shortName: 'fr',
    originalName: 'Français',
    translatedName: 'French',
    emoji: '🇫🇷',
    country: 'FR'
  },
  {
    shortName: 'it',
    originalName: 'Italiano',
    translatedName: 'Italian',
    emoji: '🇮🇹',
    country: 'IT'
  },
  {
    shortName: 'ja',
    originalName: '日本語',
    translatedName: 'Japanese',
    emoji: '🇯🇵',
    country: 'JP'
  },
  {
    shortName: 'ko',
    originalName: '한국어',
    translatedName: 'Korean',
    emoji: '🇰🇷',
    country: 'KR'
  },
  {
    shortName: 'lol',
    originalName: 'LOLCAT',
    translatedName: 'LOLCAT',
    emoji: '🐱',
  },
  // Norwegian
  {
    shortName: 'no',
    originalName: 'Norsk',
    translatedName: 'Norwegian',
    emoji: '🇳🇴',
    country: 'NO'
  },
  // Slovak
  {
    shortName: 'sk',
    originalName: 'Slovenčina',
    translatedName: 'Slovak',
    emoji: '🇸🇰',
    country: 'SK'
  },
  {
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    emoji: '🇳🇱',
    country: 'NL'
  },
  {
    shortName: 'pl',
    originalName: 'Polski',
    translatedName: 'Polish',
    emoji: '🇵🇱',
    country: 'PL'
  },
  {
    shortName: 'pt',
    originalName: 'Português',
    translatedName: 'Portuguese',
    emoji: '🇵🇹',
    country: 'PT'
  },
  {
    shortName: 'ru',
    originalName: 'Русский',
    translatedName: 'Russian',
    emoji: '🇷🇺',
    country: 'RU'
  },
  {
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
    country: 'SE'
  },
  {
    shortName: 'uk',
    originalName: 'Українська',
    translatedName: 'Ukrainian',
    emoji: '🇺🇦',
    country: 'UA'
  },
  // Vietnamese
  {
    shortName: 'vi',
    originalName: 'Tiếng Việt',
    translatedName: 'Vietnamese',
    emoji: '🇻🇳',
    country: 'VN'
  },
  {
    shortName: 'zh',
    originalName: '中文',
    translatedName: 'Chinese',
    emoji: '🇨🇳',
    country: 'CN'
  },
  {
    shortName: 'el',
    originalName: 'Ελληνικά',
    translatedName: 'Greek',
    emoji: '🇬🇷',
    country: 'GR'
  },
  {
    shortName: 'tr',
    originalName: 'Türkçe',
    translatedName: 'Turkish',
    emoji: '🇹🇷',
    country: 'TR'
  },
  {
    shortName: 'lv',
    originalName: 'Latvian',
    translatedName: 'Latvian',
    emoji: '🇱🇻',
    country: 'LV'
  },
  // Croatian
  {
    shortName: 'hr',
    originalName: 'Hrvatski',
    translatedName: 'Croatian',
    emoji: '🇭🇷',
    country: 'HR'
  },
];

export const getLanguageByCode = (code: string | null) =>
  languages.find((language) => language.shortName === code) ?? languages[languages.length - 1];
