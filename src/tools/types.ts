export interface Settings {
  searchUrl: string;
  enabledModules: string[];
  [key: string]: any;
}

export interface Config {
  name: string;
  services: serviceItem[];
  settings: Settings;
}

export const ServiceTypeList = [
  'Other',
  'Sonarr',
  'Radarr',
  'Lidarr',
  'qBittorrent',
  'Plex',
  'Emby',
];
export type ServiceType =
  | 'Other'
  | 'Sonarr'
  | 'Radarr'
  | 'Lidarr'
  | 'qBittorrent'
  | 'Plex'
  | 'Emby';

export interface serviceItem {
  [x: string]: any;
  name: string;
  type: string;
  url: string;
  icon: string;
}
