import { IconKey, IconPassword, IconUser, TablerIcon } from '@tabler/icons';
import { TileBaseType } from './tile';

export interface ServiceType extends TileBaseType {
  id: string;
  name: string;
  url: string;
  behaviour: ServiceBehaviourType;
  network: ServiceNetworkType;
  appearance: ServiceAppearanceType;
  integration: ServiceIntegrationType;
}

export type ConfigServiceType = Omit<ServiceType, 'integration'> & {
  integration?: ConfigServiceIntegrationType | null;
};

interface ServiceBehaviourType {
  onClickUrl: string;
  isOpeningNewTab: boolean;
}

interface ServiceNetworkType {
  enabledStatusChecker: boolean;
  okStatus: number[];
}

interface ServiceAppearanceType {
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

export type ServiceIntegrationType = {
  type: IntegrationType | null;
  properties: ServiceIntegrationPropertyType[];
};

export type ConfigServiceIntegrationType = Omit<ServiceIntegrationType, 'properties'> & {
  properties: ConfigServiceIntegrationPropertyType[];
};

export type ServiceIntegrationPropertyType = {
  type: 'private' | 'public';
  field: IntegrationField;
  value?: string | undefined;
  isDefined: boolean;
};

type ConfigServiceIntegrationPropertyType = Omit<ServiceIntegrationPropertyType, 'isDefined'>;

export type IntegrationField = 'apiKey' | 'password' | 'username';

export const integrationFieldProperties: {
  [key in ServiceIntegrationType['type']]: IntegrationField[];
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
    label: 'API Key',
  },
  username: {
    type: 'public',
    icon: IconUser,
    label: 'Username',
  },
  password: {
    type: 'private',
    icon: IconPassword,
    label: 'Password',
  },
};
