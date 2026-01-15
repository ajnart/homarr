import type { MRT_Localization } from "mantine-react-table";

import { objectKeys } from "@homarr/common";

export const localeConfigurations = {
  ca: {
    name: "Català",
    translatedName: "Catalan",
    icon: flagIcon("es-ct"),
    importMrtLocalization() {
      return import("./mantine-react-table/ca.json");
    },
    importDayJsLocale() {
      return import("dayjs/locale/ca").then((module) => module.default);
    },
  },
  cn: {
    name: "中文",
    translatedName: "Chinese (Simplified)",
    icon: flagIcon("cn"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/zh-Hans/index.esm.mjs").then(
        (module) => module.MRT_Localization_ZH_HANS,
      );
    },
    importDayJsLocale() {
      return import("dayjs/locale/zh-cn").then((module) => module.default);
    },
  },
  cr: {
    name: "Crowdin",
    translatedName: "Live translation",
    icon: {
      type: "custom" as const,
      url: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/crowdin.svg",
    },
    importMrtLocalization() {
      return import("mantine-react-table/locales/en/index.esm.mjs").then((module) => module.MRT_Localization_EN);
    },
    importDayJsLocale() {
      return import("dayjs/locale/en-gb").then((module) => module.default);
    },
  },
  cs: {
    name: "Čeština",
    translatedName: "Czech",
    icon: flagIcon("cz"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/cs/index.esm.mjs").then((module) => module.MRT_Localization_CS);
    },
    importDayJsLocale() {
      return import("dayjs/locale/cs").then((module) => module.default);
    },
  },
  da: {
    name: "Dansk",
    translatedName: "Danish",
    icon: flagIcon("dk"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/da/index.esm.mjs").then((module) => module.MRT_Localization_DA);
    },
    importDayJsLocale() {
      return import("dayjs/locale/da").then((module) => module.default);
    },
  },
  de: {
    name: "Deutsch",
    translatedName: "German",
    icon: flagIcon("de"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/de/index.esm.mjs").then((module) => module.MRT_Localization_DE);
    },
    importDayJsLocale() {
      return import("dayjs/locale/de").then((module) => module.default);
    },
  },
  "de-CH": {
    name: "Deutsch (Schweiz)",
    translatedName: "German (Swiss)",
    icon: flagIcon("ch"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/de/index.esm.mjs").then((module) => module.MRT_Localization_DE);
    },
    importDayJsLocale() {
      return import("dayjs/locale/de-ch").then((module) => module.default);
    },
  },
  "en-gb": {
    name: "English (UK)",
    translatedName: "English (UK)",
    icon: flagIcon("gb"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/en/index.esm.mjs").then((module) => module.MRT_Localization_EN);
    },
    importDayJsLocale() {
      return import("dayjs/locale/en-gb").then((module) => module.default);
    },
  },
  en: {
    name: "English (US)",
    translatedName: "English (US)",
    icon: flagIcon("us"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/en/index.esm.mjs").then((module) => module.MRT_Localization_EN);
    },
    importDayJsLocale() {
      return import("dayjs/locale/en").then((module) => module.default);
    },
  },
  el: {
    name: "Ελληνικά",
    translatedName: "Greek",
    icon: flagIcon("gr"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/el/index.esm.mjs").then((module) => module.MRT_Localization_EL);
    },
    importDayJsLocale() {
      return import("dayjs/locale/el").then((module) => module.default);
    },
  },
  es: {
    name: "Español",
    translatedName: "Spanish",
    icon: flagIcon("es"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/es/index.esm.mjs").then((module) => module.MRT_Localization_ES);
    },
    importDayJsLocale() {
      return import("dayjs/locale/es").then((module) => module.default);
    },
  },
  et: {
    name: "Eesti",
    translatedName: "Estonian",
    icon: flagIcon("ee"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/et/index.esm.mjs").then((module) => module.MRT_Localization_ET);
    },
    importDayJsLocale() {
      return import("dayjs/locale/et").then((module) => module.default);
    },
  },
  fr: {
    name: "Français",
    translatedName: "French",
    icon: flagIcon("fr"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/fr/index.esm.mjs").then((module) => module.MRT_Localization_FR);
    },
    importDayJsLocale() {
      return import("dayjs/locale/fr").then((module) => module.default);
    },
  },
  he: {
    name: "עברית",
    translatedName: "Hebrew",
    icon: flagIcon("il"),
    isRTL: true,
    importMrtLocalization() {
      return import("mantine-react-table/locales/he/index.esm.mjs").then((module) => module.MRT_Localization_HE);
    },
    importDayJsLocale() {
      return import("dayjs/locale/he").then((module) => module.default);
    },
  },
  hr: {
    name: "Hrvatski",
    translatedName: "Croatian",
    icon: flagIcon("hr"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/hr/index.esm.mjs").then((module) => module.MRT_Localization_HR);
    },
    importDayJsLocale() {
      return import("dayjs/locale/hr").then((module) => module.default);
    },
  },
  hu: {
    name: "Magyar",
    translatedName: "Hungarian",
    icon: flagIcon("hu"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/hu/index.esm.mjs").then((module) => module.MRT_Localization_HU);
    },
    importDayJsLocale() {
      return import("dayjs/locale/hu").then((module) => module.default);
    },
  },
  it: {
    name: "Italiano",
    translatedName: "Italian",
    icon: flagIcon("it"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/it/index.esm.mjs").then((module) => module.MRT_Localization_IT);
    },
    importDayJsLocale() {
      return import("dayjs/locale/it").then((module) => module.default);
    },
  },
  ja: {
    name: "日本語",
    translatedName: "Japanese",
    icon: flagIcon("jp"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/ja/index.esm.mjs").then((module) => module.MRT_Localization_JA);
    },
    importDayJsLocale() {
      return import("dayjs/locale/ja").then((module) => module.default);
    },
  },
  ko: {
    name: "한국어",
    translatedName: "Korean",
    icon: flagIcon("kr"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/ko/index.esm.mjs").then((module) => module.MRT_Localization_KO);
    },
    importDayJsLocale() {
      return import("dayjs/locale/ko").then((module) => module.default);
    },
  },
  lt: {
    name: "Lietuvių",
    translatedName: "Lithuanian",
    icon: flagIcon("lt"),
    importMrtLocalization() {
      return import("./mantine-react-table/lt.json");
    },
    importDayJsLocale() {
      return import("dayjs/locale/lt").then((module) => module.default);
    },
  },
  lv: {
    name: "Latviešu",
    translatedName: "Latvian",
    icon: flagIcon("lv"),
    importMrtLocalization() {
      return import("./mantine-react-table/lv.json");
    },
    importDayJsLocale() {
      return import("dayjs/locale/lv").then((module) => module.default);
    },
  },
  nl: {
    name: "Nederlands",
    translatedName: "Dutch",
    icon: flagIcon("nl"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/nl/index.esm.mjs").then((module) => module.MRT_Localization_NL);
    },
    importDayJsLocale() {
      return import("dayjs/locale/nl").then((module) => module.default);
    },
  },
  no: {
    name: "Norsk",
    translatedName: "Norwegian",
    icon: flagIcon("no"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/no/index.esm.mjs").then((module) => module.MRT_Localization_NO);
    },
    importDayJsLocale() {
      return import("dayjs/locale/nb").then((module) => module.default);
    },
  },
  pl: {
    name: "Polski",
    translatedName: "Polish",
    icon: flagIcon("pl"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/pl/index.esm.mjs").then((module) => module.MRT_Localization_PL);
    },
    importDayJsLocale() {
      return import("dayjs/locale/pl").then((module) => module.default);
    },
  },
  pt: {
    name: "Português",
    translatedName: "Portuguese",
    icon: flagIcon("pt"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/pt/index.esm.mjs").then((module) => module.MRT_Localization_PT);
    },
    importDayJsLocale() {
      return import("dayjs/locale/pt").then((module) => module.default);
    },
  },
  ro: {
    name: "Românesc",
    translatedName: "Romanian",
    icon: flagIcon("ro"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/ro/index.esm.mjs").then((module) => module.MRT_Localization_RO);
    },
    importDayJsLocale() {
      return import("dayjs/locale/ro").then((module) => module.default);
    },
  },
  ru: {
    name: "Русский",
    translatedName: "Russian",
    icon: flagIcon("ru"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/ru/index.esm.mjs").then((module) => module.MRT_Localization_RU);
    },
    importDayJsLocale() {
      return import("dayjs/locale/ru").then((module) => module.default);
    },
  },
  sk: {
    name: "Slovenčina",
    translatedName: "Slovak",
    icon: flagIcon("sk"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/sk/index.esm.mjs").then((module) => module.MRT_Localization_SK);
    },
    importDayJsLocale() {
      return import("dayjs/locale/sk").then((module) => module.default);
    },
  },
  sl: {
    name: "Slovenščina",
    translatedName: "Slovenian",
    icon: flagIcon("si"),
    importMrtLocalization() {
      return import("./mantine-react-table/sl.json");
    },
    importDayJsLocale() {
      return import("dayjs/locale/sl").then((module) => module.default);
    },
  },
  sv: {
    name: "Svenska",
    translatedName: "Swedish",
    icon: flagIcon("se"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/sv/index.esm.mjs").then((module) => module.MRT_Localization_SV);
    },
    importDayJsLocale() {
      return import("dayjs/locale/sv").then((module) => module.default);
    },
  },
  tr: {
    name: "Türkçe",
    translatedName: "Turkish",
    icon: flagIcon("tr"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/tr/index.esm.mjs").then((module) => module.MRT_Localization_TR);
    },
    importDayJsLocale() {
      return import("dayjs/locale/tr").then((module) => module.default);
    },
  },
  zh: {
    name: "中文",
    translatedName: "Chinese (Traditional)",
    icon: flagIcon("tw"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/zh-Hant/index.esm.mjs").then(
        (module) => module.MRT_Localization_ZH_HANT,
      );
    },
    importDayJsLocale() {
      return import("dayjs/locale/zh-tw").then((module) => module.default);
    },
  },
  uk: {
    name: "Українська",
    translatedName: "Ukrainian",
    icon: flagIcon("ua"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/uk/index.esm.mjs").then((module) => module.MRT_Localization_UK);
    },
    importDayJsLocale() {
      return import("dayjs/locale/uk").then((module) => module.default);
    },
  },
  vi: {
    name: "Tiếng Việt",
    translatedName: "Vietnamese",
    icon: flagIcon("vn"),
    importMrtLocalization() {
      return import("mantine-react-table/locales/vi/index.esm.mjs").then((module) => module.MRT_Localization_VI);
    },
    importDayJsLocale() {
      return import("dayjs/locale/vi").then((module) => module.default);
    },
  },
} satisfies Record<
  string,
  {
    name: string;
    translatedName: string;
    icon: LanguageIconDefinition;
    importMrtLocalization: () => Promise<MRT_Localization>;
    importDayJsLocale: () => Promise<ILocale>;
    isRTL?: boolean;
  }
>;

function flagIcon<TCode extends string>(flag: TCode) {
  return { type: "flag" as const, flag };
}

export type LanguageIconDefinition =
  | {
      type: "flag";
      flag: string;
    }
  | {
      type: "custom";
      url: string;
    };

export const supportedLanguages = objectKeys(localeConfigurations);
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const fallbackLocale = "en" satisfies SupportedLanguage;

export const isLocaleRTL = (locale: SupportedLanguage) =>
  "isRTL" in localeConfigurations[locale] && localeConfigurations[locale].isRTL;
