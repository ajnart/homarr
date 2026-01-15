import type { ColorScheme } from "@homarr/definitions";
import type { SupportedLanguage } from "@homarr/translation";

export const defaultServerSettingsKeys = [
  "analytics",
  "crawlingAndIndexing",
  "board",
  "user",
  "appearance",
  "culture",
  "search",
] as const;

export type ServerSettingsRecord = Record<(typeof defaultServerSettingsKeys)[number], Record<string, unknown>>;

export const defaultServerSettings = {
  analytics: {
    enableGeneral: true,
    enableWidgetData: false,
    enableIntegrationData: false,
    enableUserData: false,
  },
  crawlingAndIndexing: {
    noIndex: true,
    noFollow: true,
    noTranslate: true,
    noSiteLinksSearchBox: false,
  },
  board: {
    homeBoardId: null as string | null,
    mobileHomeBoardId: null as string | null,
    enableStatusByDefault: true,
    forceDisableStatus: false,
  },
  user: {
    enableGravatar: true,
  },
  appearance: {
    defaultColorScheme: "light" as ColorScheme,
  },
  culture: {
    defaultLocale: "en" as SupportedLanguage,
  },
  search: {
    defaultSearchEngineId: null as string | null,
  },
} satisfies ServerSettingsRecord;

export type ServerSettings = typeof defaultServerSettings;
