"use client";

import { useMessages, useTranslations } from "next-intl";

import type { SupportedLanguage } from "../config";
import type englishTranslation from "../lang/en.json";

export { useChangeLocale } from "./use-change-locale";
export { useCurrentLocale } from "./use-current-locale";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof englishTranslation;
    Locale: SupportedLanguage;
  }
}

export const { useI18n, useScopedI18n } = {
  useI18n: useTranslations,
  useScopedI18n: useTranslations,
};

export const { useI18nMessages } = {
  useI18nMessages: () => useMessages(),
};

export { useTranslations };
