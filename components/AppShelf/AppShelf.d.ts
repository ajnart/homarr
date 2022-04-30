export const ServiceTypes = [
  'Other',
  'Sonarr',
  'Radarr',
  'Lidarr',
  'qBittorrent',
  'Plex',
  'Emby',
];

export interface serviceItem {
  [x: string]: any;
  name: string;
  type: ServiceTypes;
  url: string;
  icon: string;
}
