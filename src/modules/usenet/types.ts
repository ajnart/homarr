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
