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
  | 'homeAssistant';

export type AppIntegrationType = {
  type: IntegrationType | null;
  properties: AppIntegrationPropertyType[];
};

export type ConfigAppIntegrationType = Omit<AppIntegrationType, 'properties'> & {
  properties: ConfigAppIntegrationPropertyType[];
};

export type AppIntegrationPropertyType = {
  type: AppIntegrationPropertyAccessabilityType;
  field: IntegrationFieldType;
  value?: string | null;
  isDefined: boolean;
};

export type AppIntegrationPropertyAccessabilityType = 'private' | 'public';

type ConfigAppIntegrationPropertyType = Omit<AppIntegrationPropertyType, 'isDefined'>;

export type IntegrationFieldType = 'apiKey' | 'password' | 'username';

export type IntegrationField = {
  type: IntegrationFieldType;
  isRequired: boolean;
}




export const integrationFieldProperties: {
  [key in Exclude<AppIntegrationType['type'], null>]: IntegrationField[] ;
} = {
  lidarr: [{ type: 'apiKey', isRequired: true }],
  radarr: [{ type: 'apiKey', isRequired: true }],
  sonarr: [{ type: 'apiKey', isRequired: true }],
  sabnzbd: [{ type: 'apiKey', isRequired: true }],
  readarr: [{ type: 'apiKey', isRequired: true }],
  overseerr: [{ type: 'apiKey', isRequired: true }],
  jellyseerr: [{ type: 'apiKey', isRequired: true }],
  deluge: [{ type: 'password', isRequired: true }],
  nzbGet: [
    { type: 'username', isRequired: true},
    { type: 'password', isRequired: true },
  ],
  qBittorrent: [
    { type: 'username', isRequired: true },
    { type: 'password', isRequired: true },
  ],
  transmission: [
    { type: 'username', isRequired: true },
    { type: 'password', isRequired: true },
  ],
  jellyfin: [{ type: 'username', isRequired: false },
  { type: 'password', isRequired: false },{ type: 'apiKey', isRequired: false }],
  plex: [{ type: 'apiKey', isRequired: true }],
  pihole: [{ type: 'apiKey', isRequired: true }],
  adGuardHome: [
    { type: 'username', isRequired: true },
    { type: 'password', isRequired: true },
  ],
  homeAssistant: [{ type: 'apiKey', isRequired: true }],
};

export type IntegrationFieldDefinitionType = {
  type: 'private' | 'public';
  icon: Icon;
  label: string;
};

export const integrationFieldDefinitions: {
  [key in IntegrationFieldType]: IntegrationFieldDefinitionType;
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
