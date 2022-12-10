import { TileBaseType } from './tile';

export interface IntegrationsType {
  calendar?: CalendarIntegrationType;
  clock?: ClockIntegrationType;
  weather?: WeatherIntegrationType;
  dashDot?: DashDotIntegrationType;
  bitTorrent?: BitTorrentIntegrationType;
  useNet?: UseNetIntegrationType;
  torrentNetworkTraffic?: TorrentNetworkTrafficIntegrationType;
}

export interface CalendarIntegrationType extends TileBaseType {
  properties: {
    isWeekStartingAtSunday: boolean;
  };
}

export interface ClockIntegrationType extends TileBaseType {
  properties: {
    is24HoursFormat: boolean;
  };
}

export interface WeatherIntegrationType extends TileBaseType {
  properties: {
    location: string;
    isFahrenheit: boolean;
  };
}

export interface DashDotIntegrationType extends TileBaseType {
  properties: {
    graphs: DashDotGraphType[];
    isStorageMultiView: boolean;
    isCpuMultiView: boolean;
    isCompactView: boolean;
    url: string;
  };
}

export type DashDotGraphType = 'cpu' | 'storage' | 'ram' | 'network' | 'gpu';

export interface BitTorrentIntegrationType extends TileBaseType {
  properties: {
    hideDownloadedTorrents: boolean;
  };
}

export interface UseNetIntegrationType extends TileBaseType {}

export interface TorrentNetworkTrafficIntegrationType extends TileBaseType {}
