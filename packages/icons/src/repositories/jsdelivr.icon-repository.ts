import { parse } from "path";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { withTimeoutAsync } from "@homarr/core/infrastructure/http/timeout";

import type { IconRepositoryLicense } from "../types/icon-repository-license";
import type { RepositoryIconGroup } from "../types/repository-icon-group";
import { IconRepository } from "./icon-repository";

export class JsdelivrIconRepository extends IconRepository {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly license: IconRepositoryLicense,
    public readonly repositoryUrl: URL,
    public readonly repositoryIndexingUrl: URL,
    public readonly repositoryBlobUrlTemplate: string,
  ) {
    super(name, slug, license, repositoryUrl, repositoryIndexingUrl, repositoryBlobUrlTemplate);
  }

  protected async getAllIconsInternalAsync(): Promise<RepositoryIconGroup> {
    const response = await withTimeoutAsync(async (signal) =>
      fetchWithTrustedCertificatesAsync(this.repositoryIndexingUrl, { signal }),
    );
    const listOfFiles = (await response.json()) as JsdelivrApiResponse;

    return {
      success: true,
      icons: listOfFiles.files
        .filter(({ name: path }) =>
          this.allowedImageFileTypes.some((allowedImageFileType) => parse(path).ext === allowedImageFileType),
        )
        .map(({ name: path, size: sizeInBytes, hash: checksum }) => {
          const file = parse(path);
          const fileNameWithExtension = file.base;

          return {
            imageUrl: this.repositoryBlobUrlTemplate.replace("{0}", path).replace("{1}", file.name),
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

interface JsdelivrApiResponse {
  files: JsdelivrFile[];
}

interface JsdelivrFile {
  name: string;
  size: number;
  hash: string;
}
