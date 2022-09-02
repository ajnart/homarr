export class Language {
  shortName: string;
  originalName: string;
  translatedName: string;

  constructor(shortName: string, originalName: string, translatedName: string) {
    this.shortName = shortName;
    this.originalName = originalName;
    this.translatedName = translatedName;
  }
}

const languages: Language[] = [
  {
    shortName: 'de',
    originalName: 'Deutsch',
    translatedName: 'German',
  },
  {
    shortName: 'en',
    originalName: 'English',
    translatedName: 'English',
  },
  {
    shortName: 'es',
    originalName: 'Español',
    translatedName: 'Spanish',
  },
  {
    shortName: 'fr',
    originalName: 'Français',
    translatedName: 'French',
  },
  {
    shortName: 'it',
    originalName: 'Italiano',
    translatedName: 'Italian',
  },
  {
    shortName: 'ja',
    originalName: '日本語',
    translatedName: 'Japanese',
  },
  {
    shortName: 'nl',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
  },
  {
    shortName: 'ru',
    originalName: 'Русский',
    translatedName: 'Russian',
  },
  {
    shortName: 'sv',
    originalName: 'Svenska',
    translatedName: 'Swedish',
  },
  {
    shortName: 'zh',
    originalName: '中文',
    translatedName: 'Chinese',
  },
];

export const getLanguageByCode = (code: string | null) =>
  languages.find((language) => language.shortName === code) ?? languages[languages.length - 1];
