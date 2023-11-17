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
