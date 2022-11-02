export class Language {
  shortName: string;
  originalName: string;
  translatedName: string;
  emoji: string;

  constructor(shortName: string, originalName: string, translatedName: string, emoji: string) {
    this.shortName = shortName;
    this.originalName = originalName;
    this.translatedName = translatedName;
    this.emoji = emoji;
  }
}

export const languages: Language[] = [
  {
    shortName: 'de',
    originalName: 'Deutsch',
    translatedName: 'German',
    emoji: '🇩🇪',
  },
  {
    shortName: 'en',
    originalName: 'English',
    translatedName: 'English',
    emoji: '🇬🇧',
  },
  // Danish
  {
    shortName: 'da',
    originalName: 'Dansk',
    translatedName: 'Danish',
    emoji: '🇩🇰',
  },
  // Hebrew
  {
    shortName: 'he',
    originalName: 'עברית',
    translatedName: 'Hebrew',
    emoji: '🇮🇱',
  },
  {
    shortName: 'es',
    originalName: 'Español',
    translatedName: 'Spanish',
    emoji: '🇪🇸',
  },
  {
    shortName: 'fr',
    originalName: 'Français',
    translatedName: 'French',
    emoji: '🇫🇷',
  },
  {
    shortName: 'it',
    originalName: 'Italiano',
    translatedName: 'Italian',
    emoji: '🇮🇹',
  },
  {
    shortName: 'ja',
    originalName: '日本語',
    translatedName: 'Japanese',
    emoji: '🇯🇵',
  },
  {
    shortName: 'ko',
    originalName: '한국어',
    translatedName: 'Korean',
    emoji: '🇰🇷',
  },
  {
    shortName: 'lol',
    originalName: 'LOLCAT',
    translatedName: 'LOLCAT',
    emoji: '🐱',
  },
  {
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    emoji: '🇳🇱',
  },
  {
    shortName: 'pl',
    originalName: 'Polski',
    translatedName: 'Polish',
    emoji: '🇵🇱',
  },
  {
    shortName: 'pt',
    originalName: 'Português',
    translatedName: 'Portuguese',
    emoji: '🇵🇹',
  },
  {
    shortName: 'ru',
    originalName: 'Русский',
    translatedName: 'Russian',
    emoji: '🇷🇺',
  },
  {
    shortName: 'sl',
    originalName: 'Slovenščina',
    translatedName: 'Slovenian',
    emoji: '🇸🇮',
  },

  {
    shortName: 'sv',
    originalName: 'Svenska',
    translatedName: 'Swedish',
    emoji: '🇸🇪',
  },
  {
    shortName: 'uk',
    originalName: 'Українська',
    translatedName: 'Ukrainian',
    emoji: '🇺🇦',
  },
  // Vietnamese
  {
    shortName: 'vi',
    originalName: 'Tiếng Việt',
    translatedName: 'Vietnamese',
    emoji: '🇻🇳',
  },
  {
    shortName: 'zh',
    originalName: '中文',
    translatedName: 'Chinese',
    emoji: '🇨🇳',
  },
];

export const getLanguageByCode = (code: string | null) =>
  languages.find((language) => language.shortName === code) ?? languages[languages.length - 1];
