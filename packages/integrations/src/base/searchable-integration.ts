export interface ISearchableIntegration<TResult extends { image?: string; name: string; link: string }> {
  searchAsync(query: string): Promise<TResult[]>;
}
