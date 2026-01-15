export interface Indexer {
  id: number;
  name: string;
  url: string;
  /**
   * Enabled: when the user enable / disable the indexer.
   * Status: when there is an error with the indexer site.
   * If one of the options are false the indexer is off.
   */
  enabled: boolean;
  status: boolean;
}
