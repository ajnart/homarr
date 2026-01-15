import type { Indexer } from "./indexer-manager-types";

export interface IIndexerManagerIntegration {
  getIndexersAsync(): Promise<Indexer[]>;
  testAllAsync(): Promise<void>;
}
