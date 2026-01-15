import { getBoardLayouts } from "@homarr/boards/context";
import { createId } from "@homarr/common";

import type { Board, DynamicSection, DynamicSectionLayout, EmptySection } from "~/app/[locale]/boards/_types";
import { getFirstEmptyPosition } from "~/components/board/items/actions/empty-position";
import { getSectionElements } from "~/components/board/items/actions/section-elements";

export const addDynamicSectionCallback = () => (board: Board) => {
  const firstSection = board.sections
    .filter((section) => section.kind === "empty")
    .sort((sectionA, sectionB) => sectionA.yOffset - sectionB.yOffset)
    .at(0);

  if (!firstSection) return board;

  const newSection = {
    id: createId(),
    kind: "dynamic",
    options: {
      title: "",
      borderColor: "",
      customCssClasses: [],
    },
    layouts: createDynamicSectionLayouts(board, firstSection),
  } satisfies DynamicSection;

  return {
    ...board,
    sections: board.sections.concat(newSection as unknown as DynamicSection),
  };
};

const createDynamicSectionLayouts = (board: Board, currentSection: EmptySection): DynamicSectionLayout[] => {
  const layouts = getBoardLayouts(board);

  return layouts.map((layoutId) => {
    const boardLayout = board.layouts.find((layout) => layout.id === layoutId);
    const elements = getSectionElements(board, { sectionId: currentSection.id, layoutId });

    const emptyPosition = boardLayout
      ? getFirstEmptyPosition(elements, boardLayout.columnCount)
      : { xOffset: 0, yOffset: 0 };

    if (!emptyPosition) {
      throw new Error("Your board is full");
    }

    return {
      width: 1,
      height: 1,
      ...emptyPosition,
      parentSectionId: currentSection.id,
      layoutId,
    };
  });
};
