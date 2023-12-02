import { IconKey, IconPassword, IconUser, TablerIconsProps } from '@tabler/icons-react';
import widgets from '~/widgets';

import { objectKeys } from '../../tools/object';

export type IntegrationTypeDefinition = {
  secrets: IntegrationSecretKey[];
  iconUrl: string;
  label: string;
  testEndpoint?: string;
};

type IntegrationSecretDefinition = {
  icon: (props: TablerIconsProps) => JSX.Element;
};

export const colorSchemes = ['environment', 'light', 'dark'] as const;
export const firstDaysOfWeek = ['monday', 'saturday', 'sunday'] as const;
export const integrationSecrets = {
  apiKey: {
    icon: IconKey,
  },
  username: {
    icon: IconUser,
  },
  password: {
    icon: IconPassword,
  },
} satisfies Record<string, IntegrationSecretDefinition>;

export const widgetTypes = objectKeys(widgets);
export const widgetOptionTypes = ['string', 'number', 'boolean', 'object', 'array', 'null'] as const;
export const boardBackgroundImageAttachmentTypes = ['fixed', 'scroll'] as const;
export const boardBackgroundImageRepeatTypes = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'] as const;
export const boardBackgroundImageSizeTypes = ['cover', 'contain'] as const;
export const appNamePositions = ['right', 'left', 'top', 'bottom'] as const;
export const appNameStyles = ['normal', 'hide', 'hover'] as const;
export const statusCodeTypes = [
  'information',
  'success',
  'redirect',
  'clientError',
  'serverError',
] as const;
const sectionTypes = ['sidebar', 'empty', 'category', 'hidden'] as const;
const layoutKinds = ['mobile', 'desktop'] as const;
export const integrationTypes = {
  readarr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/readarr.png',
    label: 'Readarr',
    testEndpoint: '/api',
  },
  radarr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/radarr.png',
    label: 'Radarr',
    testEndpoint: '/api',
  },
  sonarr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/sonarr.png',
    label: 'Sonarr',
    testEndpoint: '/api',
  },
  lidarr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/lidarr.png',
    label: 'Lidarr',
    testEndpoint: '/api',
  },
  sabnzbd: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/sabnzbd.png',
    label: 'SABnzbd',
  },
  jellyseerr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/jellyseerr.png',
    label: 'Jellyseerr',
  },
  overseerr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/overseerr.png',
    label: 'Overseerr',
  },
  deluge: {
    secrets: ['password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/deluge.png',
    label: 'Deluge',
  },
  qBittorrent: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/qbittorrent.png',
    label: 'qBittorrent',
  },
  transmission: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/transmission.png',
    label: 'Transmission',
  },
  plex: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/plex.png',
    label: 'Plex',
  },
  jellyfin: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/jellyfin.png',
    label: 'Jellyfin',
  },
  nzbGet: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/nzbget.png',
    label: 'NZBGet',
  },
  pihole: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/pi-hole.png',
    label: 'PiHole',
  },
  adGuardHome: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/adguard-home.png',
    label: 'AdGuard Home',
  },
} satisfies Record<string, IntegrationTypeDefinition>;

export type ColorScheme = (typeof colorSchemes)[number];
export type FirstDayOfWeek = (typeof firstDaysOfWeek)[number];
export type IntegrationType = keyof typeof integrationTypes;
export type IntegrationSecretKey = keyof typeof integrationSecrets;
export type WidgetType = (typeof widgetTypes)[number];
export type WidgetOptionType = (typeof widgetOptionTypes)[number];
export type BoardBackgroundImageAttachmentType =
  (typeof boardBackgroundImageAttachmentTypes)[number];
export type BoardBackgroundImageRepeatType = (typeof boardBackgroundImageRepeatTypes)[number];
export type BoardBackgroundImageSizeType = (typeof boardBackgroundImageSizeTypes)[number];
export type AppNamePosition = (typeof appNamePositions)[number];
export type AppNameStyle = (typeof appNameStyles)[number];
export type StatusCodeType = (typeof statusCodeTypes)[number];
export type SectionType = (typeof sectionTypes)[number];
export type LayoutKind = (typeof layoutKinds)[number];
