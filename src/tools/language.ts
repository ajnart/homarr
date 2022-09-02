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
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    emoji: '🇳🇱',
  },
  {
    shortName: 'ru',
    originalName: 'Русский',
    translatedName: 'Russian',
    emoji: '🇷🇺',
  },
  {
    shortName: 'sv',
    originalName: 'Svenska',
    translatedName: 'Swedish',
    emoji: '🇸🇪',
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
