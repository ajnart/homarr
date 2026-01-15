import { parse } from "path";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { withTimeoutAsync } from "@homarr/core/infrastructure/http/timeout";

import type { IconRepositoryLicense } from "../types/icon-repository-license";
import type { RepositoryIconGroup } from "../types/repository-icon-group";
import { IconRepository } from "./icon-repository";

export class GitHubIconRepository extends IconRepository {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly license: IconRepositoryLicense,
    public readonly repositoryUrl?: URL,
    public readonly repositoryIndexingUrl?: URL,
    public readonly repositoryBlobUrlTemplate?: string,
  ) {
    super(name, slug, license, repositoryUrl, repositoryIndexingUrl, repositoryBlobUrlTemplate);
  }

  protected async getAllIconsInternalAsync(): Promise<RepositoryIconGroup> {
    const url = this.repositoryIndexingUrl;
    if (!url || !this.repositoryBlobUrlTemplate) {
      throw new Error("Repository URLs are required for this repository");
    }

    const response = await withTimeoutAsync(async (signal) => fetchWithTrustedCertificatesAsync(url, { signal }));
    const listOfFiles = (await response.json()) as GitHubApiResponse;

    return {
      success: true,
      icons: listOfFiles.tree
        .filter(({ path }) =>
          this.allowedImageFileTypes.some((allowedImageFileType) => parse(path).ext === allowedImageFileType),
        )
        .map(({ path, size: sizeInBytes, sha: checksum }) => {
          const file = parse(path);
          const fileNameWithExtension = file.base;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const imageUrl = this.repositoryBlobUrlTemplate!.replace("{0}", path).replace("{1}", file.name);
          return {
            imageUrl,
            fileNameWithExtension,
            local: false,
            sizeInBytes,
            checksum,
          };
        }),
      slug: this.slug,
    };
  }
}

interface GitHubApiResponse {
  sha: string;
  url: string;
  tree: TreeItem[];
  truncated: boolean;
}

export interface TreeItem {
  path: string;
  mode: string;
  sha: string;
  url: string;
  size?: number;
}
