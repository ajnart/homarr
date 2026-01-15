import type { Board } from "~/app/[locale]/boards/_types";

export const getSectionElements = (board: Board, { sectionId, layoutId }: { sectionId: string; layoutId: string }) => {
  const dynamicSectionsOfFirstSection = board.sections
    .filter((section) => section.kind === "dynamic")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map(({ layouts, ...section }) => ({ ...section, ...layouts.find((layout) => layout.layoutId === layoutId)! }))
    .filter((section) => section.parentSectionId === sectionId);
  const items = board.items
    .map(({ layouts, ...item }) => ({
      ...item,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...layouts.find((layout) => layout.layoutId === layoutId)!,
    }))
    .filter((item) => item.sectionId === sectionId);

  return [...items, ...dynamicSectionsOfFirstSection];
};
