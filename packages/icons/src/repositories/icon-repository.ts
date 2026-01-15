import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";

import type { IconRepositoryLicense } from "../types/icon-repository-license";
import type { RepositoryIconGroup } from "../types/repository-icon-group";

const logger = createLogger({ module: "iconRepository" });

export abstract class IconRepository {
  protected readonly allowedImageFileTypes = [".png", ".svg", ".jpeg"];

  protected constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly license: IconRepositoryLicense,
    public readonly repositoryUrl?: URL,
    public readonly repositoryIndexingUrl?: URL,
    public readonly repositoryBlobUrlTemplate?: string,
  ) {}

  public async getAllIconsAsync(): Promise<RepositoryIconGroup> {
    try {
      return await this.getAllIconsInternalAsync();
    } catch (err) {
      logger.error(
        new ErrorWithMetadata("Unable to request icons from repository", { slug: this.slug }, { cause: err }),
      );
      return {
        success: false,
        icons: [],
        slug: this.slug,
      };
    }
  }

  protected abstract getAllIconsInternalAsync(): Promise<RepositoryIconGroup>;
}
