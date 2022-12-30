import { IconKey, IconPassword, IconUser, TablerIcon } from '@tabler/icons';
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
  externalUrl?: string;
  isOpeningNewTab: boolean;
}

interface AppNetworkType {
  enabledStatusChecker: boolean;
  okStatus: number[];
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
  | 'nzbGet';

export type AppIntegrationType = {
  type: IntegrationType | null;
  properties: AppIntegrationPropertyType[];
};

export type ConfigAppIntegrationType = Omit<AppIntegrationType, 'properties'> & {
  properties: ConfigAppIntegrationPropertyType[];
};

export type AppIntegrationPropertyType = {
  type: 'private' | 'public';
  field: IntegrationField;
  value?: string | undefined;
  isDefined: boolean;
};

type ConfigAppIntegrationPropertyType = Omit<AppIntegrationPropertyType, 'isDefined'>;

export type IntegrationField = 'apiKey' | 'password' | 'username';

export const integrationFieldProperties: {
  [key in Exclude<AppIntegrationType['type'], null>]: IntegrationField[];
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
};

export type IntegrationFieldDefinitionType = {
  type: 'private' | 'public';
  icon: TablerIcon;
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
