import { DEFAULT_THEME, MANTINE_COLORS, MantineColor } from '@mantine/core';
import { z } from 'zod';
import {
  BackgroundImageAttachment,
  BackgroundImageRepeat,
  BackgroundImageSize,
} from '~/types/settings';

export const configNameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9-_\s()]+$/)
  .min(1);

export const createBoardSchemaValidation = z.object({
  name: configNameSchema,
});

export const boardCustomizationSchema = z.object({
  access: z.object({
    allowGuests: z.boolean(),
  }),
  layout: z.object({
    leftSidebarEnabled: z.boolean(),
    rightSidebarEnabled: z.boolean(),
    pingsEnabled: z.boolean(),
  }),
  gridstack: z.object({
    sm: z.number().min(1).max(8),
    md: z.number().min(3).max(16),
    lg: z.number().min(5).max(20),
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
});
