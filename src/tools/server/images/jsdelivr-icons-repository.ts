import {
  AbstractIconRepository,
  NormalizedIcon,
  NormalizedIconRepositoryResult,
} from './abstract-icons-repository';

export class JsdelivrIconsRepository extends AbstractIconRepository {
  static tablerRepository = {
    api: 'https://data.jsdelivr.com/v1/packages/gh/walkxcode/dashboard-icons@main?structure=flat',
    blob: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/{0}/{1}',
  } as JsdelivrRepositoryUrl;

  constructor(
    private readonly repository: JsdelivrRepositoryUrl,
    private readonly displayName: string
  ) {
    super();
  }

  protected async fetchInternally(): Promise<NormalizedIconRepositoryResult> {
    const response = await fetch(this.repository.api);
    const body = (await response.json()) as JsdelivrResponse;

    const normalizedEntries = body.files
      .filter((file) => !['_banner.png', '_logo.png'].some((x) => file.name.includes(x)))
      .filter((file) => ['.png', '.svg'].some((x) => file.name.endsWith(x)))
      .map((file): NormalizedIcon => {
        const fileNameParts = file.name.split('/');
        const fileName = fileNameParts[fileNameParts.length - 1];
        const extensions = fileName.split('.')[1];
        return {
          url: this.repository.blob.replace('{0}', extensions).replace('{1}', fileName),
          name: fileName,
          size: file.size,
        };
      });

    return {
      entries: normalizedEntries,
      count: normalizedEntries.length,
      success: true,
      name: this.displayName,
    };
  }
}

type JsdelivrRepositoryUrl = {
  api: string;
  blob: string;
};

type JsdelivrResponse = {
  files: JsdelivrFile[];
};

type JsdelivrFile = {
  name: string;
  size: number;
};
