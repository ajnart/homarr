import { useMemo } from "react";

import type { GridItemHTMLElement } from "@homarr/gridstack";

import type { DynamicSectionItem, SectionItem } from "~/app/[locale]/boards/_types";
import { BoardItemContent } from "../items/item-content";
import { BoardDynamicSection } from "./dynamic-section";
import { GridStackItem } from "./gridstack/gridstack-item";
import { useSectionContext } from "./section-context";
import { useSectionItems } from "./use-section-items";

export const SectionContent = () => {
  const { innerSections, items, refs } = useSectionContext();

  /**
   * IMPORTANT: THE ORDER OF THE BELOW ITEMS HAS TO MATCH THE ORDER OF
   * THE ITEMS RENDERED WITH GRIDSTACK, OTHERWISE THE ITEMS WILL BE MIXED UP
   * @see https://github.com/homarr-labs/homarr/pull/1770
   */
  const sortedItems = useMemo(() => {
    return [...items, ...innerSections].sort((itemA, itemB) => {
      if (itemA.yOffset === itemB.yOffset) {
        return itemA.xOffset - itemB.xOffset;
      }

      return itemA.yOffset - itemB.yOffset;
    });
  }, [items, innerSections]);

  return (
    <>
      {sortedItems.map((item) => (
        <Item key={item.id} item={item} innerRef={refs.items.current[item.id]} />
      ))}
    </>
  );
};

interface ItemProps {
  item: DynamicSectionItem | SectionItem;
  innerRef: React.RefObject<GridItemHTMLElement | null> | undefined;
}

const Item = ({ item, innerRef }: ItemProps) => {
  const minWidth = useMinSize(item, "x");
  const minHeight = useMinSize(item, "y");

  return (
    <GridStackItem
      key={item.id}
      innerRef={innerRef}
      width={item.width}
      height={item.height}
      xOffset={item.xOffset}
      yOffset={item.yOffset}
      kind={item.kind}
      id={item.id}
      type={item.type}
      minWidth={minWidth}
      minHeight={minHeight}
    >
      {item.type === "item" ? <BoardItemContent item={item} /> : <BoardDynamicSection section={item} />}
    </GridStackItem>
  );
};

/**
 * Calculates the min width / height of a section by taking the maximum of
 * the sum of the offset and size of all items and dynamic sections inside.
 * @param direction either "x" or "y"
 * @param items items of the section
 * @param sections sections of the board to look for dynamic sections
 * @param parentSectionId the id of the section we want to calculate the min size for
 * @returns the min size
 */
const useMinSize = (item: DynamicSectionItem | SectionItem, direction: "x" | "y") => {
  const { items, innerSections } = useSectionItems(item.id);
  if (item.type === "item") return undefined;

  const size = direction === "x" ? "width" : "height";
  return Math.max(
    ...items.map((item) => item[`${direction}Offset`] + item[size]),
    ...innerSections.map((item) => item[`${direction}Offset`] + item[size]),
  );
};
