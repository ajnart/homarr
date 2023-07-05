import { IconKey, IconPassword, IconUser, Icon } from '@tabler/icons-react';

import { TileBaseType } from './tile';

export interface AppType extends TileBaseType {
  id: string;
  name: string;
  url: string;
  behaviour: AppBehaviourType;
  network: AppNetworkType;
  appearance: AppAppearanceType;
  integration: Integration;
}

export type ConfigAppType = Omit<AppType, 'integration'> & {
  integration?: ConfigAppIntegrationType | undefined;
};

interface AppBehaviourType {
  externalUrl: string;
  isOpeningNewTab: boolean;
}

interface AppNetworkType {
  enabledStatusChecker: boolean;
  okStatus?: number[];
  statusCodes: string[];
}

interface AppAppearanceType {
  iconUrl: string;
}

export type IntegrationType =
  | 'readarr'
  | 'radarr'
  | 'sonarr'
  | 'lidarr'
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
  | 'adGuardHome';

export type Integration = {
  type?: IntegrationType;
  id: string;
  url: string;
  name: string;
  properties: AppIntegrationPropertyType[];
};

export type ConfigAppIntegrationType = Omit<Integration, 'properties'> & {
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
  [key in Exclude<Integration['type'], undefined>]: IntegrationField[];
} = {
  lidarr: ['apiKey'],
  radarr: ['apiKey'],
  sonarr: ['apiKey'],
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
  pihole: ['password'],
  adGuardHome: ['username', 'password'],
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
