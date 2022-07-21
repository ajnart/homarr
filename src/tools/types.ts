import { MantineTheme } from '@mantine/core';
import { OptionValues } from '../components/modules/modules';

export interface Settings {
  searchUrl: string;
  title?: string;
  logo?: string;
  favicon?: string;
  primaryColor?: MantineTheme['primaryColor'];
  secondaryColor?: MantineTheme['primaryColor'];
  primaryShade?: MantineTheme['primaryShade'];
  background?: string;
  appOpacity?: number;
  widgetPosition?: string;
  appCardWidth?: number;
}

export interface Config {
  name: string;
  services: serviceItem[];
  settings: Settings;
  modules: {
    [key: string]: ConfigModule;
  };
}

interface ConfigModule {
  title: string;
  enabled: boolean;
  options: {
    [key: string]: OptionValues;
  };
}

export const StatusCodes = [
  { value: '200', label: '200 - OK', group: 'Sucessful responses' },
  { value: '204', label: '204 - No Content', group: 'Sucessful responses' },
  { value: '301', label: '301 - Moved Permanently', group: 'Redirection responses' },
  { value: '302', label: '302 - Found / Moved Temporarily', group: 'Redirection responses' },
  { value: '304', label: '304 - Not Modified', group: 'Redirection responses' },
  { value: '307', label: '307 - Temporary Redirect', group: 'Redirection responses' },
  { value: '308', label: '308 - Permanent Redirect', group: 'Redirection responses' },
  { value: '400', label: '400 - Bad Request', group: 'Client error responses' },
  { value: '401', label: '401 - Unauthorized', group: 'Client error responses' },
  { value: '403', label: '403 - Forbidden', group: 'Client error responses' },
  { value: '404', label: '404 - Not Found', group: 'Client error responses' },
  { value: '408', label: '408 - Request Timeout', group: 'Client error responses' },
  { value: '410', label: '410 - Gone', group: 'Client error responses' },
  { value: '429', label: '429 - Too Many Requests', group: 'Client error responses' },
  { value: '500', label: '500 - Internal Server Error', group: 'Server error responses' },
  { value: '502', label: '502 - Bad Gateway', group: 'Server error responses' },
  { value: '503', label: '503 - Service Unavailable', group: 'Server error responses' },
  { value: '054', label: '504 - Gateway Timeout Error', group: 'Server error responses' },
];

export const Targets = [
  { value: '_blank', label: 'New Tab' },
  { value: '_top', label: 'Same Window' },
];

export const ServiceTypeList = [
  'Other',
  'Dash.',
  'Deluge',
  'Emby',
  'Lidarr',
  'Plex',
  'qBittorrent',
  'Radarr',
  'Readarr',
  'Sonarr',
  'Transmission',
];
export type ServiceType =
  | 'Other'
  | 'Dash.'
  | 'Deluge'
  | 'Emby'
  | 'Lidarr'
  | 'Plex'
  | 'qBittorrent'
  | 'Radarr'
  | 'Readarr'
  | 'Sonarr'
  | 'Transmission';

export const MatchingImages: { image: string; type: ServiceType }[] = [
  //Official images
  { image: 'mauricenino/dashdot', type: 'Dash.' },
  { image: 'emby/embyserver', type: 'Emby' },
  { image: 'plexinc/pms-docker', type: 'Plex' },
  //Hotio images
  { image: 'hotio/lidarr', type: 'Lidarr' },
  { image: 'hotio/radarr', type: 'Radarr' },
  { image: 'hotio/readarr', type: 'Readarr' },
  { image: 'hotio/sonarr', type: 'Sonarr' },   
  { image: 'ghcr.io/hotio/lidarr', type: 'Lidarr' },
  { image: 'ghcr.io/hotio/radarr', type: 'Radarr' },
  { image: 'ghcr.io/hotio/readarr', type: 'Readarr' },
  { image: 'ghcr.io/hotio/sonarr', type: 'Sonarr' }, 
  { image: 'cr.hotio.dev/hotio/lidarr', type: 'Lidarr' },
  { image: 'cr.hotio.dev/hotio/radarr', type: 'Radarr' },
  { image: 'cr.hotio.dev/hotio/readarr', type: 'Readarr' },
  { image: 'cr.hotio.dev/hotio/sonarr', type: 'Sonarr' }, 
  //LinuxServer images
  { image: 'lscr.io/linuxserver/deluge', type: 'Deluge' },
  { image: 'lscr.io/linuxserver/emby', type: 'Emby' },
  { image: 'lscr.io/linuxserver/lidarr', type: 'Lidarr' },
  { image: 'lscr.io/linuxserver/plex', type: 'Plex' },
  { image: 'lscr.io/linuxserver/qbittorrent', type: 'qBittorrent' },
  { image: 'lscr.io/linuxserver/radarr', type: 'Radarr' },
  { image: 'lscr.io/linuxserver/readarr', type: 'Readarr' },
  { image: 'lscr.io/linuxserver/sonarr', type: 'Sonarr' },
  { image: 'lscr.io/linuxserver/transmission', type: 'Transmission' }, 
  //High usage
  { image: 'markusmcnugen/qbittorrentvpn', type: 'qBittorrent' },
  { image: 'haugene/transmission-openvpn', type: 'Transmission' }, 
];

export interface serviceItem {
  id: string;
  name: string;
  type: string;
  url: string;
  icon: string;
  category?: string;
  apiKey?: string;
  password?: string;
  username?: string;
  openedUrl?: string;
  newTab?: boolean;
  status?: string[];
}
