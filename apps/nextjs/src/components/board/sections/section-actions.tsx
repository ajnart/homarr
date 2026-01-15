import { useCallback } from "react";

import { getCurrentLayout } from "@homarr/boards/context";
import { useUpdateBoard } from "@homarr/boards/updater";

interface MoveAndResizeInnerSection {
  innerSectionId: string;
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
}
interface MoveInnerSectionToSection {
  innerSectionId: string;
  sectionId: string;
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
}

export const useSectionActions = () => {
  const { updateBoard } = useUpdateBoard();

  const moveAndResizeInnerSection = useCallback(
    ({ innerSectionId, ...positionProps }: MoveAndResizeInnerSection) => {
      updateBoard((previous) => ({
        ...previous,
        sections: previous.sections.map((section) => {
          // Return same section if section is not the one we're moving
          if (section.id !== innerSectionId) return section;
          if (section.kind !== "dynamic") return section;

          const currentLayout = getCurrentLayout(previous);

          return {
            ...section,
            layouts: section.layouts.map((layout) => {
              if (layout.layoutId !== currentLayout) return layout;
              return {
                ...layout,
                ...positionProps,
              };
            }),
          };
        }),
      }));
    },
    [updateBoard],
  );

  const moveInnerSectionToSection = useCallback(
    ({ innerSectionId, sectionId, ...positionProps }: MoveInnerSectionToSection) => {
      updateBoard((previous) => {
        return {
          ...previous,
          sections: previous.sections.map((section) => {
            // Return section without changes when not the section we're moving
            if (section.id !== innerSectionId) return section;
            if (section.kind !== "dynamic") return section;

            const currentLayout = getCurrentLayout(previous);

            return {
              ...section,
              layouts: section.layouts.map((layout) => {
                if (layout.layoutId !== currentLayout) return layout;
                return {
                  ...layout,
                  ...positionProps,
                  parentSectionId: sectionId,
                };
              }),
            };
          }),
        };
      });
    },
    [updateBoard],
  );

  return {
    moveAndResizeInnerSection,
    moveInnerSectionToSection,
  };
};
