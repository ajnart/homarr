import { AbstractIconRepository, NormalizedIcon, NormalizedIconRepositoryResult } from './abstract-icons-repository';

export class GitHubIconsRepository extends AbstractIconRepository {
  static readonly walkxcode = {
    api: 'https://api.github.com/repos/walkxcode/dashboard-icons/git/trees/main?recursive=true',
    blob: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/{0}/{1}',
  } as GitHubRepositoryUrl;

  constructor(
    private readonly repository: GitHubRepositoryUrl,
    private readonly displayName: string,
    copyright: string
  ) {
    super(copyright);
  }

  protected async fetchInternally(): Promise<NormalizedIconRepositoryResult> {
    const response = await fetch(this.repository.api, { 
      
    });
    const body = (await response.json()) as GitHubRepo;

    const normalizedEntries = body.tree
      .filter((file) => !['banner.png', 'logo.png'].some((x) => file.path.includes(x)))
      .filter((file) => ['.png', '.svg'].some((x) => file.path.endsWith(x)))
      .sort((a, b) => {
        if (a.path.endsWith('.svg') && b.path.endsWith('.png')) {
          return -1;
        }
        if (a.path.endsWith('.png') && b.path.endsWith('.svg')) {
          return 1;
        }
        return 0;
      })
      .map((file): NormalizedIcon => {
        const fileNameParts = file.path.split('/');
        const fileName = fileNameParts[fileNameParts.length - 1];
        const extensions = fileName.split('.')[1];
        return {
          url: this.repository.blob.replace('{0}', extensions).replace('{1}', fileName),
          name: fileName,
          size: file.size ?? 0,
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

  protected name: string = "GitHub";
}

type GitHubRepositoryUrl = {
  api: string;
  blob: string;
};


export interface GitHubRepo {
  sha: string;
  url: string;
  tree: Tree[];
  truncated: boolean;
}

export interface Tree {
  path: string;
  mode: string;
  type: Type;
  sha: string;
  url: string;
  size?: number;
}

export enum Type {
  Blob = 'blob',
  Tree = 'tree',
}
