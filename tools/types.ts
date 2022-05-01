export interface Settings {
  searchUrl: string;
  searchBar: boolean;
  [key: string]: any;
}

export interface Config {
  services: serviceItem[];
  settings: Settings;
  [key: string]: any;
}

export const ServiceTypes = ['Other', 'Sonarr', 'Radarr', 'Lidarr', 'qBittorrent', 'Plex', 'Emby'];

export interface serviceItem {
  [x: string]: any;
  name: string;
  type: string;
  url: string;
  icon: string;
}
