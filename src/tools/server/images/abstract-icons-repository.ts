export abstract class AbstractIconRepository {
  constructor(readonly copyright?: string) {}

  async fetch(): Promise<NormalizedIconRepositoryResult> {
    try {
      return await this.fetchInternally();
    } catch (err) {
      return {
        success: false,
        count: 0,
        entries: [],
        name: '',
        copyright: this.copyright,
      };
    }
  }
  protected abstract fetchInternally(): Promise<NormalizedIconRepositoryResult>;
}

export type NormalizedIconRepositoryResult = {
  name: string;
  success: boolean;
  count: number;
  copyright: string | undefined;
  entries: NormalizedIcon[];
};

export type NormalizedIcon = {
  url: string;
  name: string;
  size: number;
};
