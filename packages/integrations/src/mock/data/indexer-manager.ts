import type { IIndexerManagerIntegration } from "../../interfaces/indexer-manager/indexer-manager-integration";
import type { Indexer } from "../../types";

export class IndexerManagerMockService implements IIndexerManagerIntegration {
  public async getIndexersAsync(): Promise<Indexer[]> {
    return await Promise.resolve(
      Array.from({ length: 10 }, (_, index) => IndexerManagerMockService.createIndexer(index + 1)),
    );
  }
  public async testAllAsync(): Promise<void> {
    await Promise.resolve();
  }

  private static createIndexer(index: number): Indexer {
    return {
      id: index,
      name: `Mock Indexer ${index}`,
      url: `https://mock-indexer-${index}.com`,
      enabled: Math.random() > 0.2, // 80% chance of being enabled
      status: Math.random() > 0.2, // 80% chance of being active
    };
  }
}
