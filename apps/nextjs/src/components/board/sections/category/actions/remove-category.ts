import { getBoardLayouts } from "@homarr/boards/context";

import type { Board, CategorySection, EmptySection, Section } from "~/app/[locale]/boards/_types";

export interface RemoveCategoryInput {
  id: string;
}

export const removeCategoryCallback =
  (input: RemoveCategoryInput) =>
  (previous: Board): Board => {
    const currentCategory = previous.sections.find(
      (section): section is CategorySection => section.kind === "category" && section.id === input.id,
    );
    if (!currentCategory) {
      return previous;
    }

    const emptySectionsAbove = previous.sections.filter(
      (section): section is EmptySection => section.kind === "empty" && section.yOffset < currentCategory.yOffset,
    );
    const aboveSection = emptySectionsAbove.sort((sectionA, sectionB) => sectionB.yOffset - sectionA.yOffset).at(0);

    const emptySectionsBelow = previous.sections.filter(
      (section): section is EmptySection => section.kind === "empty" && section.yOffset > currentCategory.yOffset,
    );
    const removedSection = emptySectionsBelow.sort((sectionA, sectionB) => sectionA.yOffset - sectionB.yOffset).at(0);

    if (!aboveSection || !removedSection) {
      return previous;
    }

    const aboveYOffsets = getBoardLayouts(previous).map((layoutId) => {
      return {
        layoutId,
        yOffset: Math.max(
          calculateYHeightWithOffsetForItemLayouts(previous, { sectionId: aboveSection.id, layoutId }),
          calculateYHeightWithOffsetForDynamicSectionLayouts(previous.sections, {
            sectionId: aboveSection.id,
            layoutId,
          }),
        ),
      };
    });

    const categoryYOffsets = getBoardLayouts(previous).map((layoutId) => {
      return {
        layoutId,
        yOffset: Math.max(
          calculateYHeightWithOffsetForItemLayouts(previous, { sectionId: currentCategory.id, layoutId }),
          calculateYHeightWithOffsetForDynamicSectionLayouts(previous.sections, {
            sectionId: currentCategory.id,
            layoutId,
          }),
        ),
      };
    });

    return {
      ...previous,
      sections: previous.sections
        .filter((section) => section.id !== currentCategory.id && section.id !== removedSection.id)
        .map((section) =>
          section.kind === "dynamic"
            ? {
                ...section,
                layouts: section.layouts.map((layout) => {
                  const aboveYOffset = aboveYOffsets.find(({ layoutId }) => layout.layoutId === layoutId)?.yOffset ?? 0;
                  const categoryYOffset =
                    categoryYOffsets.find(({ layoutId }) => layout.layoutId === layoutId)?.yOffset ?? 0;

                  if (layout.parentSectionId === currentCategory.id) {
                    return {
                      ...layout,
                      yOffset: layout.yOffset + aboveYOffset,
                      parentSectionId: aboveSection.id,
                    };
                  }

                  if (layout.parentSectionId === removedSection.id) {
                    return {
                      ...layout,
                      yOffset: layout.yOffset + aboveYOffset + categoryYOffset,
                      parentSectionId: aboveSection.id,
                    };
                  }

                  return layout;
                }),
              }
            : section,
        ),

      items: previous.items.map((item) => ({
        ...item,
        layouts: item.layouts.map((layout) => {
          const aboveYOffset = aboveYOffsets.find(({ layoutId }) => layout.layoutId === layoutId)?.yOffset ?? 0;
          const categoryYOffset = categoryYOffsets.find(({ layoutId }) => layout.layoutId === layoutId)?.yOffset ?? 0;

          if (layout.sectionId === currentCategory.id) {
            return {
              ...layout,
              yOffset: layout.yOffset + aboveYOffset,
              sectionId: aboveSection.id,
            };
          }

          if (layout.sectionId === removedSection.id) {
            return {
              ...layout,
              yOffset: layout.yOffset + aboveYOffset + categoryYOffset,
              sectionId: aboveSection.id,
            };
          }

          return layout;
        }),
      })),
    };
  };

const calculateYHeightWithOffsetForDynamicSectionLayouts = (
  sections: Section[],
  { sectionId, layoutId }: { sectionId: string; layoutId: string },
) => {
  return sections
    .filter((section) => section.kind === "dynamic")
    .map((section) => section.layouts.find((layout) => layout.layoutId === layoutId))
    .filter((layout) => layout !== undefined)
    .filter((layout) => layout.parentSectionId === sectionId)
    .reduce((acc, layout) => {
      const yHeightWithOffset = layout.yOffset + layout.height;
      if (yHeightWithOffset > acc) return yHeightWithOffset;
      return acc;
    }, 0);
};

const calculateYHeightWithOffsetForItemLayouts = (
  board: Board,
  { sectionId, layoutId }: { sectionId: string; layoutId: string },
) =>
  board.items
    .map((item) => item.layouts.find((layout) => layout.layoutId === layoutId))
    .filter((layout) => layout !== undefined)
    .filter((layout) => layout.sectionId === sectionId)
    .reduce((acc, layout) => {
      const yHeightWithOffset = layout.yOffset + layout.height;
      if (yHeightWithOffset > acc) return yHeightWithOffset;
      return acc;
    }, 0);
