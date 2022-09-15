import { registerEnumType } from '@nestjs/graphql';

export enum ServiceType {
  Other = 'Other',
  DashDot = 'DashDot',
  Deluge = 'Deluge',
  Emby = 'Emby',
  Lidarr = 'Lidarr',
  Plex = 'Plex',
  qBittorrent = 'qBittorrent',
  Radarr = 'Radarr',
  Readarr = 'Readarr',
  Sonarr = 'Sonarr',
  Overseerr = 'Overseerr',
  Jellyseerr = 'Jellyseerr',
  Transmission = 'Transmission',
  Sabnzbd = 'Sabnzbd',
}

registerEnumType(ServiceType, { name: 'ServiceType' });
