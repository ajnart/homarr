export abstract class AbstractIconRepository {
  async fetch(): Promise<NormalizedIconRepositoryResult> {
    try {
      return await this.fetchInternally();
    } catch (err) {
      return {
        success: false,
        count: 0,
        entries: [],
        name: '',
      };
    }
  }
  protected abstract fetchInternally(): Promise<NormalizedIconRepositoryResult>;
}

export type NormalizedIconRepositoryResult = {
  name: string;
  success: boolean;
  count: number;
  entries: NormalizedIcon[];
};

export type NormalizedIcon = {
  url: string;
  name: string;
  size: number;
};
