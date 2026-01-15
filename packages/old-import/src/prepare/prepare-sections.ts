import type { OldmarrConfig } from "@homarr/old-schema";

import { mapCategorySection, mapEmptySection } from "../mappers/map-section";

export const prepareSections = (
  boardId: string,
  { categories, wrappers }: Pick<OldmarrConfig, "categories" | "wrappers">,
) =>
  new Map(
    categories
      .map((category) => [category.id, mapCategorySection(boardId, category)] as const)
      .concat(wrappers.map((wrapper) => [wrapper.id, mapEmptySection(boardId, wrapper)] as const)),
  );
