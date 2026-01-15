import { createId } from "@homarr/common";
import type { InferInsertModel } from "@homarr/db";
import type { sections } from "@homarr/db/schema";
import type { OldmarrCategorySection, OldmarrEmptySection } from "@homarr/old-schema";

export const mapCategorySection = (
  boardId: string,
  category: OldmarrCategorySection,
): InferInsertModel<typeof sections> => ({
  id: createId(),
  boardId,
  kind: "category",
  xOffset: 0,
  yOffset: category.position,
  name: category.name,
});

export const mapEmptySection = (boardId: string, wrapper: OldmarrEmptySection): InferInsertModel<typeof sections> => ({
  id: createId(),
  boardId,
  kind: "empty",
  xOffset: 0,
  yOffset: wrapper.position,
});
