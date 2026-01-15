import { z } from "zod/v4";

const baseSearchEngineSchema = z.object({
  properties: z.object({
    openInNewTab: z.boolean().default(true),
    enabled: z.boolean().default(true),
  }),
});

const commonSearchEngineSchema = z
  .object({
    type: z.enum(["google", "duckDuckGo", "bing"]),
  })
  .and(baseSearchEngineSchema);

const customSearchEngineSchema = z
  .object({
    type: z.literal("custom"),
    properties: z.object({
      template: z.string(),
    }),
  })
  .and(baseSearchEngineSchema);

const searchEngineSchema = z.union([commonSearchEngineSchema, customSearchEngineSchema]);

const commonSettingsSchema = z.object({
  searchEngine: searchEngineSchema,
});

const accessSettingsSchema = z.object({
  allowGuests: z.boolean(),
});

const gridstackSettingsSchema = z
  .object({
    columnCountSmall: z.number(),
    columnCountMedium: z.number(),
    columnCountLarge: z.number(),
  })
  .catch({
    columnCountSmall: 3,
    columnCountMedium: 6,
    columnCountLarge: 12,
  });

const layoutSettingsSchema = z.object({
  enabledLeftSidebar: z.boolean(),
  enabledRightSidebar: z.boolean(),
  enabledDocker: z.boolean(),
  enabledPing: z.boolean(),
  enabledSearchbar: z.boolean(),
});

const colorsSettingsSchema = z.object({
  primary: z.string().optional(),
  secondary: z.string().optional(),
  shade: z.number().optional(),
});

const customizationSettingsSchema = z.object({
  layout: layoutSettingsSchema,
  pageTitle: z.string().optional(),
  metaTitle: z.string().optional(),
  logoImageUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  backgroundImageAttachment: z.enum(["fixed", "scroll"]).optional(),
  backgroundImageSize: z.enum(["cover", "contain"]).optional(),
  backgroundImageRepeat: z.enum(["no-repeat", "repeat", "repeat-x", "repeat-y"]).optional(),
  customCss: z.string().optional(),
  colors: colorsSettingsSchema,
  appOpacity: z.number().optional(),
  gridstack: gridstackSettingsSchema,
});

export const settingsSchema = z.object({
  common: commonSettingsSchema,
  customization: customizationSettingsSchema,
  access: accessSettingsSchema,
});
