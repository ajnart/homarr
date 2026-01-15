import { createId } from "@homarr/common";

import type { Board, EmptySection, ItemLayout, Section } from "~/app/[locale]/boards/_types";
import { getFirstEmptyPosition } from "./empty-position";
import { getSectionElements } from "./section-elements";

export interface DuplicateItemInput {
  itemId: string;
}

export const duplicateItemCallback =
  ({ itemId }: DuplicateItemInput) =>
  (previous: Board): Board => {
    const itemToDuplicate = previous.items.find((item) => item.id === itemId);
    if (!itemToDuplicate) return previous;

    const clonedItem = structuredClone(itemToDuplicate);

    return {
      ...previous,
      items: previous.items.concat({
        ...clonedItem,
        id: createId(),
        layouts: clonedItem.layouts.map((layout) => ({
          ...layout,
          ...getNextPosition(previous, layout),
        })),
      }),
    };
  };

const getNextPosition = (board: Board, layout: ItemLayout): { xOffset: number; yOffset: number; sectionId: string } => {
  const currentSection = board.sections.find((section) => section.id === layout.sectionId);
  if (currentSection) {
    const emptySectionPosition = getEmptySectionPosition(board, layout, currentSection);
    if (emptySectionPosition) {
      return {
        ...emptySectionPosition,
        sectionId: currentSection.id,
      };
    }
  }

  const firstSection = board.sections
    .filter((section): section is EmptySection => section.kind === "empty")
    .sort((sectionA, sectionB) => sectionA.yOffset - sectionB.yOffset)
    .at(0);

  if (!firstSection) {
    throw new Error("Your board is full. reason='no first section'");
  }

  const emptySectionPosition = getEmptySectionPosition(board, layout, firstSection);

  if (!emptySectionPosition) {
    throw new Error("Your board is full. reason='no empty positions'");
  }

  return {
    ...emptySectionPosition,
    sectionId: firstSection.id,
  };
};

const getEmptySectionPosition = (
  board: Board,
  layout: ItemLayout,
  section: Section,
): { xOffset: number; yOffset: number } | undefined => {
  const boardLayout = board.layouts.find((boardLayout) => boardLayout.id === layout.layoutId);
  if (!boardLayout) return;

  const sectionElements = getSectionElements(board, { sectionId: layout.sectionId, layoutId: layout.layoutId });
  if (section.kind !== "dynamic") {
    return getFirstEmptyPosition(sectionElements, boardLayout.columnCount, undefined, {
      width: layout.width,
      height: layout.height,
    });
  }

  const sectionLayout = section.layouts.find((sectionLayout) => sectionLayout.layoutId === layout.layoutId);
  if (!sectionLayout) return;

  return getFirstEmptyPosition(sectionElements, sectionLayout.width, sectionLayout.height, {
    width: layout.width,
    height: layout.height,
  });
};
