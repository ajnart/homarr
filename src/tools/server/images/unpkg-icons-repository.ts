import { AbstractIconRepository, NormalizedIcon, NormalizedIconRepositoryResult } from './abstract-icons-repository';

export class UnpkgIconsRepository extends AbstractIconRepository {
  static tablerRepository = 'https://unpkg.com/@tabler/icons-png@2.0.0-beta/icons/';

  constructor(
    private readonly repository: string,
    private readonly displayName: string,
    copyright: string
  ) {
    super(copyright);
  }

  protected async fetchInternally(): Promise<NormalizedIconRepositoryResult> {
    const response = await fetch(`${this.repository}?meta`);
    const body = (await response.json()) as UnpkgResponse;

    const normalizedEntries = body.files
      .filter((file) => file.type === 'file')
      .map((file): NormalizedIcon => {
        const fileName = file.path.replace('/icons/', '');
        const url = `${this.repository}${fileName}`;
        return {
          name: fileName,
          url,
          size: file.size,
        };
      });

    return {
      entries: normalizedEntries,
      count: normalizedEntries.length,
      success: true,
      name: this.displayName,
      copyright: this.copyright,
    };
  }

  protected name: string = "UnPkg";
}

type UnpkgResponse = {
  files: UnpkgFile[];
};

type UnpkgFile = {
  path: string;
  type: string;
  size: number;
};
