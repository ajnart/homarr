import type { Board, DynamicSection } from "~/app/[locale]/boards/_types";

export interface RemoveDynamicSectionInput {
  id: string;
}

export const removeDynamicSectionCallback =
  ({ id }: RemoveDynamicSectionInput) =>
  (board: Board): Board => {
    const sectionToRemove = board.sections.find(
      (section): section is DynamicSection => section.id === id && section.kind === "dynamic",
    );
    if (!sectionToRemove) return board;

    return {
      ...board,
      sections: board.sections
        .filter((section) => section.id !== id)
        .map((section) => {
          if (section.kind !== "dynamic") return section;

          // Change xOffset and yOffset of sections that were below the removed section and set parentSectionId to the parent of the removed section
          return {
            ...section,
            layouts: section.layouts.map((layout) => {
              if (layout.parentSectionId !== sectionToRemove.id) return layout;

              const removedSectionLayout = sectionToRemove.layouts.find(
                (layoutToRemove) => layoutToRemove.layoutId === layout.layoutId,
              );
              if (!removedSectionLayout) throw new Error("Layout not found");

              return {
                ...layout,
                xOffset: layout.xOffset + removedSectionLayout.xOffset,
                yOffset: layout.yOffset + removedSectionLayout.yOffset,
                parentSectionId: removedSectionLayout.parentSectionId,
              };
            }),
          };
        }),
      // Move all items in dynamic section to parent of the removed section
      items: board.items.map((item) => ({
        ...item,
        layouts: item.layouts.map((layout) => {
          if (layout.sectionId !== sectionToRemove.id) return layout;

          const removedSectionLayout = sectionToRemove.layouts.find(
            (layoutToRemove) => layoutToRemove.layoutId === layout.layoutId,
          );
          if (!removedSectionLayout) throw new Error("Layout not found");

          return {
            ...layout,
            xOffset: layout.xOffset + removedSectionLayout.xOffset,
            yOffset: layout.yOffset + removedSectionLayout.yOffset,
            sectionId: removedSectionLayout.parentSectionId,
          };
        }),
      })),
    };
  };
