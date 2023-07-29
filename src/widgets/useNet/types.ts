export interface UsenetQueueItem {
  name: string;
  progress: number;
  /**
   * Size in bytes
   */
  size: number;
  id: string;
  state: 'paused' | 'downloading' | 'queued';
  eta: number;
}
export interface UsenetHistoryItem {
  name: string;
  /**
   * Size in bytes
   */
  size: number;
  id: string;
  time: number;
}

export interface UsenetHistoryRequestParams {
  appId: string;
  offset: number;
  limit: number;
}

export interface UsenetHistoryResponse {
  items: UsenetHistoryItem[];
  total: number;
}

export interface UsenetInfoRequestParams {
  appId: string;
}

export interface UsenetInfoResponse {
  paused: boolean;
  sizeLeft: number;
  speed: number;
  eta: number;
}

export interface UsenetPauseRequestParams {
  appId: string;
}

export interface UsenetQueueRequestParams {
  appId: string;
  offset: number;
  limit: number;
}

export interface UsenetQueueResponse {
  items: UsenetQueueItem[];
  total: number;
}

export interface UsenetResumeRequestParams {
  appId: string;
  nzbId?: string;
}
