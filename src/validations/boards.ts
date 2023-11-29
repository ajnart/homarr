import { DEFAULT_THEME, MANTINE_COLORS, MantineColor } from '@mantine/core';
import { z } from 'zod';
import {
  BackgroundImageAttachment,
  BackgroundImageRepeat,
  BackgroundImageSize,
} from '~/types/settings';

export const createBoardSchemaValidation = z.object({
  name: z.string().min(2).max(25),
});

export const boardCustomizationSchema = z.object({
  access: z.object({
    allowGuests: z.boolean(),
  }),
  network: z.object({
    pingsEnabled: z.boolean(),
  }),
  pageMetadata: z.object({
    pageTitle: z.string(),
    metaTitle: z.string(),
    logoSrc: z.string(),
    faviconSrc: z.string(),
  }),
  appearance: z.object({
    backgroundSrc: z.string(),
    backgroundImageAttachment: z.enum(BackgroundImageAttachment),
    backgroundImageSize: z.enum(BackgroundImageSize),
    backgroundImageRepeat: z.enum(BackgroundImageRepeat),
    primaryColor: z.custom<MantineColor>(
      (value) => typeof value === 'string' && MANTINE_COLORS.includes(value)
    ),
    secondaryColor: z.custom<MantineColor>(
      (value) => typeof value === 'string' && MANTINE_COLORS.includes(value)
    ),
    shade: z
      .number()
      .min(0)
      .max(DEFAULT_THEME.colors['blue'].length - 1),
    opacity: z.number().min(10).max(100),
    customCss: z.string(),
  }),
  search: z.object({
    mediaIntegrations: z.array(z.string()),
  }),
});

export const boardNameSchema = z.string().regex(/^[a-zA-Z0-9-_]+$/);

export const createBoardSchema = z.object({
  pageTitle: z.string(),
  boardName: boardNameSchema,
  allowGuests: z.boolean(),
});
