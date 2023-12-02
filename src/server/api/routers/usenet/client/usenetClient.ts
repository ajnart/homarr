import { WidgetIntegration } from '~/server/db/queries/widget';

import { NzbgetUsenetClient } from './nzbgetUsenetClient';
import { SabnzbdUsenetClient } from './sabnzbdUsenetClient';

export interface UsenetClient {
  info(): Promise<UsenetInfo>;
  history(options: UsenetPaginationOptions): Promise<UsenetHistory>;
  queue(options: UsenetPaginationOptions): Promise<UsenetQueue>;

  pause(): Promise<void>;
  resume(): Promise<void>;
}

export function createUsenetClient(integration: WidgetIntegration) {
  if (integration.type === 'nzbGet') return new NzbgetUsenetClient(integration);
  return new SabnzbdUsenetClient(integration);
}

export type UsenetInfo = {
  paused: boolean;
  sizeLeft: number;
  speed: number;
  eta: number;
};

export type UsenetPaginationOptions = {
  limit: number;
  offset: number;
};

export type UsenetHistory = {
  items: UsenetHistoryItem[];
  total: number;
};

export type UsenetHistoryItem = {
  name: string;
  /**
   * Size in bytes
   */
  size: number;
  id: string;
  time: number;
};

export type UsenetQueue = {
  items: UsenetQueueItem[];
  total: number;
};

export type UsenetQueueItem = {
  name: string;
  progress: number;
  /**
   * Size in bytes
   */
  size: number;
  id: string;
  state: 'paused' | 'downloading' | 'queued';
  eta: number;
};
