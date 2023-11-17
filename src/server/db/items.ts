import { IconKey, IconPassword, IconUser, TablerIconsProps } from '@tabler/icons-react';
import widgets from '~/widgets';

import { objectEntries, objectKeys } from '../../tools/object';

type IntegrationTypeDefinition = {
  secrets: IntegrationSecretKey[];
  iconUrl: string;
  label: string;
  groups: IntegrationGroup[];
};
type IntegrationGroup =
  | 'mediaServer'
  | 'mediaRequest'
  | 'mediaApp'
  | 'usenet'
  | 'torrent'
  | 'download'
  | 'dns';

type IntegrationSecretDefinition = {
  visibility: IntegrationSecretVisibility;
  icon: (props: TablerIconsProps) => JSX.Element;
};

export const colorSchemes = ['environment', 'light', 'dark'] as const;
export const firstDaysOfWeek = ['monday', 'saturday', 'sunday'] as const;
export const integrationSecretVisibility = ['private', 'public'] as const;
export const integrationSecrets = {
  apiKey: {
    visibility: 'private',
    icon: IconKey,
  },
  username: {
    visibility: 'public',
    icon: IconUser,
  },
  password: {
    visibility: 'private',
    icon: IconPassword,
  },
} satisfies Record<string, IntegrationSecretDefinition>;
export const widgetSorts = objectKeys(widgets);
export const widgetOptionTypes = [
  'string',
  'number',
  'boolean',
  'object',
  'array',
  'null',
] as const;
export const boardBackgroundImageAttachmentTypes = ['fixed', 'scroll'] as const;
export const boardBackgroundImageRepeatTypes = [
  'repeat',
  'repeat-x',
  'repeat-y',
  'no-repeat',
] as const;
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
export const sectionTypes = ['sidebar', 'empty', 'category', 'hidden'] as const;
export const layoutKinds = ['mobile', 'desktop'] as const;
export const integrationTypes = {
  readarr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/readarr.png',
    label: 'Readarr',
    groups: ['mediaApp'],
  },
  radarr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/radarr.png',
    label: 'Radarr',
    groups: ['mediaApp'],
  },
  sonarr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/sonarr.png',
    label: 'Sonarr',
    groups: ['mediaApp'],
  },
  lidarr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/lidarr.png',
    label: 'Lidarr',
    groups: ['mediaApp'],
  },
  sabnzbd: {
    secrets: [],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/sabnzbd.png',
    label: 'SABnzbd',
    groups: ['usenet', 'download'],
  },
  jellyseerr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/jellyseerr.png',
    label: 'Jellyseerr',
    groups: ['mediaRequest'],
  },
  overseerr: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/overseerr.png',
    label: 'Overseerr',
    groups: ['mediaRequest'],
  },
  deluge: {
    secrets: ['password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/deluge.png',
    label: 'Deluge',
    groups: ['torrent'],
  },
  qBittorrent: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/qbittorrent.png',
    label: 'qBittorrent',
    groups: ['torrent'],
  },
  transmission: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/transmission.png',
    label: 'Transmission',
    groups: ['torrent'],
  },
  plex: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/plex.png',
    label: 'Plex',
    groups: ['mediaServer'],
  },
  jellyfin: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/jellyfin.png',
    label: 'Jellyfin',
    groups: ['mediaServer'],
  },
  nzbGet: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/nzbget.png',
    label: 'NZBGet',
    groups: ['usenet', 'download'],
  },
  pihole: {
    secrets: ['apiKey'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/pi-hole.png',
    label: 'PiHole',
    groups: ['dns'],
  },
  adGuardHome: {
    secrets: ['username', 'password'],
    iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/adguard-home.png',
    label: 'AdGuard Home',
    groups: ['dns'],
  },
} satisfies Record<string, IntegrationTypeDefinition>;

export type ColorScheme = (typeof colorSchemes)[number];
export type FirstDayOfWeek = (typeof firstDaysOfWeek)[number];
export type IntegrationType = keyof typeof integrationTypes;
export type IntegrationSecretVisibility = (typeof integrationSecretVisibility)[number];
export type IntegrationSecretKey = keyof typeof integrationSecrets;
export type WidgetSort = (typeof widgetSorts)[number];
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

type InferIntegrationTypeFromGroup<TGroup extends IntegrationGroup> = {
  [key in keyof typeof integrationTypes]: (typeof integrationTypes)[key] extends {
    groups: TGroup[];
  }
    ? key
    : never;
}[keyof typeof integrationTypes];

export const integrationGroup = <TGroup extends IntegrationGroup>(group: TGroup) => {
  return objectEntries(integrationTypes)
    .filter(([, { groups }]) => groups.some((g) => group === g))
    .map(([key]) => key) as InferIntegrationTypeFromGroup<TGroup>[];
};
