import { useMemo } from "react";

import { useCurrentLayout, useRequiredBoard } from "@homarr/boards/context";

import type { DynamicSectionItem, SectionItem } from "~/app/[locale]/boards/_types";

export const useSectionItems = (sectionId: string): { innerSections: DynamicSectionItem[]; items: SectionItem[] } => {
  const board = useRequiredBoard();
  const currentLayoutId = useCurrentLayout();

  const innerSections = useMemo(
    () =>
      board.sections
        .filter((innerSection) => innerSection.kind === "dynamic")
        .map(({ layouts, ...innerSection }) => {
          const layout = layouts.find((layout) => layout.layoutId === currentLayoutId);

          if (!layout) return null;

          return {
            ...layout,
            ...innerSection,
            type: "section" as const,
          };
        })
        .filter((item) => item !== null)
        .filter((innerSection) => innerSection.parentSectionId === sectionId),
    [board.sections, currentLayoutId, sectionId],
  );

  const items = useMemo(
    () =>
      board.items
        .map(({ layouts, ...item }) => {
          const layout = layouts.find((layout) => layout.layoutId === currentLayoutId);
          if (!layout) return null;

          return {
            ...layout,
            ...item,
            type: "item" as const,
          };
        })
        .filter((item) => item !== null)
        .filter((item) => item.sectionId === sectionId),
    [board.items, currentLayoutId, sectionId],
  );

  return {
    innerSections,
    items,
  };
};
