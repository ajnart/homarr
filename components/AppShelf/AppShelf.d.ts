export const ServiceTypes = [
  'Other',
  'Sonarr',
  'Radarr',
  'Lidarr',
  'Plex',
  'Emby',
]

export interface serviceItem {
  name: string;
  type: ServiceTypes;
  url: string;
  icon: string;
}