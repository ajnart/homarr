import type { RefObject } from "react";

import type { GridItemHTMLElement } from "@homarr/gridstack";
import { GridStack } from "@homarr/gridstack";

import type { Section } from "~/app/[locale]/boards/_types";

interface InitializeGridstackProps {
  section: Omit<Section, "items">;
  itemIds: string[];
  refs: {
    wrapper: RefObject<HTMLDivElement | null>;
    items: RefObject<Record<string, RefObject<GridItemHTMLElement | null>>>;
    gridstack: RefObject<GridStack | null>;
  };
  sectionColumnCount: number;
}

export const initializeGridstack = ({ section, itemIds, refs, sectionColumnCount }: InitializeGridstackProps) => {
  if (!refs.wrapper.current) return false;
  // initialize gridstack
  const newGrid = refs.gridstack;
  newGrid.current = GridStack.init(
    {
      column: sectionColumnCount,
      margin: 10,
      cellHeight: 128,
      float: true,
      alwaysShowResizeHandle: true,
      acceptWidgets: true,
      staticGrid: true,
      minRow: section.kind === "dynamic" && "height" in section ? (section.height as number) : 1,
      maxRow: section.kind === "dynamic" && "height" in section ? (section.height as number) : 0,
      animate: false,
      styleInHead: true,
      disableRemoveNodeOnDrop: true,
    },
    // selector of the gridstack item (it's eather category or wrapper)
    `.grid-stack-${section.kind}[data-section-id='${section.id}']`,
  );
  const grid = newGrid.current;

  // Must be used to update the column count after the initialization
  grid.column(sectionColumnCount, "none");

  grid.batchUpdate();
  grid.removeAll(false);
  itemIds.forEach((id) => {
    const ref = refs.items.current[id]?.current;
    if (!ref) return;

    grid.makeWidget(ref);
  });
  grid.batchUpdate(false);
  return true;
};
