import { MantineTheme } from '@mantine/core';

export interface SettingsType {
  common: CommonSettingsType;
  customization: CustomizationSettingsType;
  access: BoardAccessSettingsType;
}

export interface BoardAccessSettingsType {
  allowGuests: boolean;
}

export interface CommonSettingsType {
  searchEngine: SearchEngineCommonSettingsType;
}

export type SearchEngineCommonSettingsType =
  | CommonSearchEngineCommonSettingsType
  | CustomSearchEngineCommonSettingsType;

export interface CommonSearchEngineCommonSettingsType extends BaseSearchEngineType {
  type: 'google' | 'duckDuckGo' | 'bing';
}

interface CustomSearchEngineCommonSettingsType extends BaseSearchEngineType {
  type: 'custom';
  properties: {
    template: string;
    openInNewTab: boolean;
    enabled: boolean;
  };
}

interface BaseSearchEngineType {
  properties: {
    openInNewTab: boolean;
    enabled: boolean;
  };
}

export interface CustomizationSettingsType {
  layout: LayoutCustomizationSettingsType;
  pageTitle?: string;
  metaTitle?: string;
  logoImageUrl?: string;
  faviconUrl?: string;
  backgroundImageUrl?: string;
  backgroundImageAttachment?: typeof BackgroundImageAttachment[number];
  backgroundImageSize?: typeof BackgroundImageSize[number];
  backgroundImageRepeat?: typeof BackgroundImageRepeat[number];
  customCss?: string;
  colors: ColorsCustomizationSettingsType;
  appOpacity?: number;
  gridstack?: GridstackSettingsType;
  accessibility: AccessibilitySettings;
}

export const BackgroundImageAttachment = ['fixed',  'scroll'] as const;

export const BackgroundImageSize = ['cover', 'contain'] as const;

export const BackgroundImageRepeat = ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'] as const;

export interface AccessibilitySettings {
  disablePingPulse: boolean;
  replacePingDotsWithIcons: boolean;
}

export interface GridstackSettingsType {
  columnCountSmall: number; // default: 3
  columnCountMedium: number; // default: 6
  columnCountLarge: number; // default: 12
}

interface LayoutCustomizationSettingsType {
  enabledLeftSidebar: boolean;
  enabledRightSidebar: boolean;
  enabledDocker: boolean;
  enabledPing: boolean;
  enabledSearchbar: boolean;
}

interface ColorsCustomizationSettingsType {
  primary?: MantineTheme['primaryColor'];
  secondary?: MantineTheme['primaryColor'];
  shade?: MantineTheme['primaryShade'];
}
