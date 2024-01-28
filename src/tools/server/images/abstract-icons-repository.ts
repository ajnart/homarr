import Consola from 'consola';

export abstract class AbstractIconRepository {
  protected constructor(readonly copyright?: string) {}

  async fetch(): Promise<NormalizedIconRepositoryResult> {
    try {
      return await this.fetchInternally();
    } catch (err) {
      Consola.error(`Failed to fetch icons from repository '${this.name}': ${err}`);
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

  protected abstract name: string;
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
