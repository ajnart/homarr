import { getTranslations } from "next-intl/server";

import type { SupportedLanguage } from "./config";
import type englishTranslation from "./lang/en.json";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof englishTranslation;
    Locale: SupportedLanguage;
  }
}

export const { getI18n, getScopedI18n } = {
  getI18n: getTranslations,
  getScopedI18n: getTranslations,
};

export { getMessages as getI18nMessages } from "next-intl/server";
