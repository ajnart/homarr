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
    shortName: 'de-DE',
    originalName: 'Deutsch',
    translatedName: 'German',
    emoji: '🇩🇪',
  },
  {
    shortName: 'en-US',
    originalName: 'English',
    translatedName: 'English',
    emoji: '🇬🇧',
  },
  {
    shortName: 'da-DK',
    originalName: 'Dansk',
    translatedName: 'Danish',
    emoji: '🇩🇰',
  },
  {
    shortName: 'he-IL',
    originalName: 'עברית',
    translatedName: 'Hebrew',
    emoji: '🇮🇱',
  },
  {
    shortName: 'es-ES',
    originalName: 'Español',
    translatedName: 'Spanish',
    emoji: '🇪🇸',
  },
  {
    shortName: 'fr-FR',
    originalName: 'Français',
    translatedName: 'French',
    emoji: '🇫🇷',
  },
  {
    shortName: 'it-IT',
    originalName: 'Italiano',
    translatedName: 'Italian',
    emoji: '🇮🇹',
  },
  {
    shortName: 'ja-JP',
    originalName: '日本語',
    translatedName: 'Japanese',
    emoji: '🇯🇵',
  },
  {
    shortName: 'ko-KR',
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
    shortName: 'no-NO',
    originalName: 'Norsk',
    translatedName: 'Norwegian',
    emoji: '🇳🇴',
  },
  {
    shortName: 'sk-SK',
    originalName: 'Slovenčina',
    translatedName: 'Slovak',
    emoji: '🇸🇰',
  },
  {
    shortName: 'nl-NL',
    originalName: 'Nederlands',
    translatedName: 'Dutch',
    emoji: '🇳🇱',
  },
  {
    shortName: 'pl-PL',
    originalName: 'Polski',
    translatedName: 'Polish',
    emoji: '🇵🇱',
  },
  {
    shortName: 'pt-PT',
    originalName: 'Português',
    translatedName: 'Portuguese',
    emoji: '🇵🇹',
  },
  {
    shortName: 'ru-RU',
    originalName: 'Русский',
    translatedName: 'Russian',
    emoji: '🇷🇺',
  },
  {
    shortName: 'sl-SI',
    originalName: 'Slovenščina',
    translatedName: 'Slovenian',
    emoji: '🇸🇮',
  },

  {
    shortName: 'sv-SE',
    originalName: 'Svenska',
    translatedName: 'Swedish',
    emoji: '🇸🇪',
  },
  {
    shortName: 'uk-UA',
    originalName: 'Українська',
    translatedName: 'Ukrainian',
    emoji: '🇺🇦',
  },
  {
    shortName: 'vi-VN',
    originalName: 'Tiếng Việt',
    translatedName: 'Vietnamese',
    emoji: '🇻🇳',
  },
  {
    shortName: 'zh-CN',
    originalName: '中文',
    translatedName: 'Chinese',
    emoji: '🇨🇳',
  },
  {
    shortName: 'el-GR',
    originalName: 'Ελληνικά',
    translatedName: 'Greek',
    emoji: '🇬🇷',
  },
];

export const getLanguageByCode = (code: string): Language | undefined =>
  languages.find((language) => language.shortName === code);
