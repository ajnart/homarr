import { MantineTheme } from '@mantine/core';

export interface SettingsType {
  common: CommonSettingsType;
  customization: CustomizationSettingsType;
}

export interface CommonSettingsType {
  searchEngine: SearchEngineCommonSettingsType;
  defaultConfig: string;
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
  customCss?: string;
  colors: ColorsCustomizationSettingsType;
  appOpacity?: number;
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
