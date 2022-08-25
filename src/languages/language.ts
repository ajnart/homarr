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
];

export const getLanguageByCode = (code: string | null) =>
  languages.find((language) => language.shortName === code) ?? languages[-1];
