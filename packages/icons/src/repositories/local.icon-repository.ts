import { createHash } from "crypto";

import type { InferSelectModel } from "@homarr/db";
import { db } from "@homarr/db";
import type { medias } from "@homarr/db/schema";

import type { RepositoryIcon, RepositoryIconGroup } from "../types";
import { IconRepository } from "./icon-repository";

export const LOCAL_ICON_REPOSITORY_SLUG = "local";

export class LocalIconRepository extends IconRepository {
  constructor() {
    super("Local", LOCAL_ICON_REPOSITORY_SLUG, undefined, undefined, undefined, undefined);
  }
  protected async getAllIconsInternalAsync(): Promise<RepositoryIconGroup> {
    const medias = await db.query.medias.findMany();
    return {
      success: true,
      icons: medias.map(mapMediaToIcon),
      slug: LOCAL_ICON_REPOSITORY_SLUG,
    };
  }
}

export const createLocalImageUrl = (id: string) => `/api/user-medias/${id}`;

export const mapMediaToIcon = (
  media: Pick<InferSelectModel<typeof medias>, "name" | "id" | "content" | "size">,
): RepositoryIcon => ({
  local: true,
  fileNameWithExtension: media.name,
  imageUrl: createLocalImageUrl(media.id),
  checksum: createHash("md5").update(media.content).digest("hex"),
  sizeInBytes: media.size,
});
