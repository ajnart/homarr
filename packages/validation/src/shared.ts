import { z } from "zod/v4";

import { integrationKinds, widgetKinds } from "@homarr/definitions";

import { zodEnumFromArray } from "./enums";

export const integrationSchema = z.object({
  id: z.string(),
  kind: zodEnumFromArray(integrationKinds),
  name: z.string(),
  url: z.string(),
});

export type BoardItemIntegration = z.infer<typeof integrationSchema>;

export const itemAdvancedOptionsSchema = z.object({
  title: z.string().max(64).nullable().default(null),
  customCssClasses: z.array(z.string()).default([]),
  borderColor: z.string().default(""),
});

export type BoardItemAdvancedOptions = z.infer<typeof itemAdvancedOptionsSchema>;

export const sharedItemSchema = z.object({
  id: z.string(),
  layouts: z.array(
    z.object({
      layoutId: z.string(),
      yOffset: z.number(),
      xOffset: z.number(),
      width: z.number(),
      height: z.number(),
      sectionId: z.string(),
    }),
  ),
  integrationIds: z.array(z.string()),
  advancedOptions: itemAdvancedOptionsSchema,
});

export const commonItemSchema = z
  .object({
    kind: zodEnumFromArray(widgetKinds),
    options: z.record(z.string(), z.unknown()),
  })
  .and(sharedItemSchema);

const categorySectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.literal("category"),
  yOffset: z.number(),
  xOffset: z.number(),
  collapsed: z.boolean(),
});

const emptySectionSchema = z.object({
  id: z.string(),
  kind: z.literal("empty"),
  yOffset: z.number(),
  xOffset: z.number(),
});

export const dynamicSectionOptionsSchema = z.object({
  title: z.string().max(20).default(""),
  customCssClasses: z.array(z.string()).default([]),
  borderColor: z.string().default(""),
});

const dynamicSectionSchema = z.object({
  id: z.string(),
  kind: z.literal("dynamic"),
  options: dynamicSectionOptionsSchema,
  layouts: z.array(
    z.object({
      layoutId: z.string(),
      yOffset: z.number(),
      xOffset: z.number(),
      width: z.number(),
      height: z.number(),
      parentSectionId: z.string(),
    }),
  ),
});

export const sectionSchema = z.union([categorySectionSchema, emptySectionSchema, dynamicSectionSchema]);
