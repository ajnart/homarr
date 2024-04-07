import { Icon, IconKey, IconPassword, IconUser } from '@tabler/icons-react';
import { Property } from 'csstype';

import { TileBaseType } from './tile';

export interface AppType extends TileBaseType {
  id: string;
  name: string;
  url: string;
  behaviour: AppBehaviourType;
  network: AppNetworkType;
  appearance: AppAppearanceType;
  integration: AppIntegrationType;
}

export type ConfigAppType = Omit<AppType, 'integration'> & {
  integration?: ConfigAppIntegrationType | null;
};

interface AppBehaviourType {
  externalUrl: string;
  isOpeningNewTab: boolean;
  tooltipDescription?: string;
}

interface AppNetworkType {
  enabledStatusChecker: boolean;
  /**
   * @deprecated replaced by statusCodes
   */
  okStatus?: number[];
  statusCodes: string[];
}

interface AppAppearanceType {
  iconUrl: string;
  appNameStatus: 'normal' | 'hover' | 'hidden';
  positionAppName: Property.FlexDirection;
  appNameFontSize: number;
  lineClampAppName: number;
}

export type IntegrationType =
  | 'readarr'
  | 'radarr'
  | 'sonarr'
  | 'lidarr'
  | 'prowlarr'
  | 'sabnzbd'
  | 'jellyseerr'
  | 'overseerr'
  | 'deluge'
  | 'qBittorrent'
  | 'transmission'
  | 'plex'
  | 'jellyfin'
  | 'nzbGet'
  | 'pihole'
  | 'adGuardHome'
  | 'homeAssistant'
  | 'openmediavault'
  | 'proxmox'
  | 'tdarr';

export type AppIntegrationType = {
  type: IntegrationType | null;
  properties: AppIntegrationPropertyType[];
};

export type ConfigAppIntegrationType = Omit<AppIntegrationType, 'properties'> & {
  properties: ConfigAppIntegrationPropertyType[];
};

export type AppIntegrationPropertyType = {
  type: AppIntegrationPropertyAccessabilityType;
  field: IntegrationField;
  value?: string | null;
  isDefined: boolean;
};

export type AppIntegrationPropertyAccessabilityType = 'private' | 'public';

type ConfigAppIntegrationPropertyType = Omit<AppIntegrationPropertyType, 'isDefined'>;

export type IntegrationField = 'apiKey' | 'password' | 'username';

export const integrationFieldProperties: {
  [key in Exclude<AppIntegrationType['type'], null>]: IntegrationField[];
} = {
  lidarr: ['apiKey'],
  radarr: ['apiKey'],
  sonarr: ['apiKey'],
  prowlarr: ['apiKey'],
  sabnzbd: ['apiKey'],
  readarr: ['apiKey'],
  overseerr: ['apiKey'],
  jellyseerr: ['apiKey'],
  deluge: ['password'],
  nzbGet: ['username', 'password'],
  qBittorrent: ['username', 'password'],
  transmission: ['username', 'password'],
  jellyfin: ['username', 'password'],
  plex: ['apiKey'],
  pihole: ['apiKey'],
  adGuardHome: ['username', 'password'],
  homeAssistant: ['apiKey'],
  openmediavault: ['username', 'password'],
  proxmox: ['apiKey'],
  tdarr: [],
};

export type IntegrationFieldDefinitionType = {
  type: 'private' | 'public';
  icon: Icon;
  label: string;
};

export const integrationFieldDefinitions: {
  [key in IntegrationField]: IntegrationFieldDefinitionType;
} = {
  apiKey: {
    type: 'private',
    icon: IconKey,
    label: 'common:secrets.apiKey',
  },
  username: {
    type: 'public',
    icon: IconUser,
    label: 'common:secrets.username',
  },
  password: {
    type: 'private',
    icon: IconPassword,
    label: 'common:secrets.password',
  },
};
