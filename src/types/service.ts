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
  onClickUrl?: string;
  isOpeningNewTab: boolean;
}

interface ServiceNetworkType {
  enabledStatusChecker: boolean;
  okStatus: number[];
}

interface ServiceAppearanceType {
  iconUrl: string;
}

type ServiceIntegrationType =
  | ServiceIntegrationApiKeyType
  | ServiceIntegrationPasswordType
  | ServiceIntegrationUsernamePasswordType;

export interface ServiceIntegrationApiKeyType {
  type: 'readarr' | 'radarr' | 'sonarr' | 'lidarr' | 'sabnzbd' | 'jellyseerr' | 'overseerr';
  properties: {
    apiKey: string;
  };
}

interface ServiceIntegrationPasswordType {
  type: 'deluge';
  properties: {
    password?: string;
  };
}

interface ServiceIntegrationUsernamePasswordType {
  type: 'qBittorrent' | 'transmission';
  properties: {
    username?: string;
    password?: string;
  };
}
