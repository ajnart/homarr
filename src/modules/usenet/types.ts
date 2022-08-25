export interface UsenetQueueItem {
  name: string;
  progress: number;
  size: number;
  id: string;
  state: 'paused' | 'downloading' | 'queued';
  eta: number;
}
export interface UsenetHistoryItem {
  name: string;
  size: number;
  id: string;
}
