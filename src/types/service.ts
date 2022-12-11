import {
  IconKey,
  IconKeyOff,
  IconLockOff,
  IconPassword,
  IconUser,
  IconUserOff,
  TablerIcon,
} from '@tabler/icons';
import { TileBaseType } from './tile';

export interface ServiceType extends TileBaseType {
  id: string;
  name: string;
  url: string;
  behaviour: ServiceBehaviourType;
  network: ServiceNetworkType;
  appearance: ServiceAppearanceType;
  integration?: ServiceIntegrationType;
}

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

type IntegrationType =
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
  type: IntegrationType;
  properties: ServiceIntegrationPropertyType[];
};

type ServiceIntegrationPropertyType = {
  type: 'private' | 'public';
  field: IntegrationField;
  value?: string;
};

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
  icon: TablerIcon;
  iconUnset: TablerIcon;
  label: string;
};

export const integrationFieldDefinitions: {
  [key in IntegrationField]: IntegrationFieldDefinitionType;
} = {
  apiKey: {
    icon: IconKey,
    iconUnset: IconKeyOff,
    label: 'API Key',
  },
  username: {
    icon: IconUser,
    iconUnset: IconUserOff,
    label: 'Username',
  },
  password: {
    icon: IconPassword,
    iconUnset: IconLockOff,
    label: 'Password',
  },
};
