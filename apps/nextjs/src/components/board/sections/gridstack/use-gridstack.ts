import type { RefObject } from "react";
import { createRef, useCallback, useEffect, useRef } from "react";
import { useElementSize } from "@mantine/hooks";

import { useCurrentLayout, useRequiredBoard } from "@homarr/boards/context";
import { useEditMode } from "@homarr/boards/edit-mode";
import type { GridHTMLElement, GridItemHTMLElement, GridStack, GridStackNode } from "@homarr/gridstack";

import type { Section } from "~/app/[locale]/boards/_types";
import { useMarkSectionAsReady } from "~/app/[locale]/boards/(content)/_ready-context";
import { useItemActions } from "../../items/item-actions";
import { useSectionActions } from "../section-actions";
import { initializeGridstack } from "./init-gridstack";

export interface UseGridstackRefs {
  wrapper: RefObject<HTMLDivElement | null>;
  items: RefObject<Record<string, RefObject<GridItemHTMLElement | null>>>;
  gridstack: RefObject<GridStack | null>;
}

interface UseGristackReturnType {
  refs: UseGridstackRefs;
}

/**
 * When the size of a gridstack changes we need to update the css variables
 * so the gridstack items are displayed correctly
 * @param wrapper gridstack wrapper
 * @param gridstack gridstack object
 * @param width width of the section (column count)
 * @param height height of the section (row count)
 * @param isDynamic if the section is dynamic
 */
const handleResizeChange = (
  wrapper: HTMLDivElement,
  gridstack: GridStack,
  width: number,
  height: number,
  isDynamic: boolean,
) => {
  wrapper.style.setProperty("--gridstack-column-count", width.toString());
  wrapper.style.setProperty("--gridstack-row-count", height.toString());

  let cellHeight = wrapper.clientWidth / width;
  if (isDynamic) {
    cellHeight = wrapper.clientHeight / height;
  }

  if (!isDynamic) {
    document.body.style.setProperty("--gridstack-cell-size", cellHeight.toString());
  }

  gridstack.cellHeight(cellHeight);
};

export const useGridstack = (section: Omit<Section, "items">, itemIds: string[]): UseGristackReturnType => {
  const [isEditMode] = useEditMode();
  const markAsReady = useMarkSectionAsReady();
  const { moveAndResizeItem, moveItemToSection } = useItemActions();
  const { moveAndResizeInnerSection, moveInnerSectionToSection } = useSectionActions();

  // define reference for wrapper - is used to calculate the width of the wrapper
  const { ref: wrapperRef, width, height } = useElementSize<HTMLDivElement>();
  // references to the diffrent items contained in the gridstack
  const itemRefs = useRef<Record<string, RefObject<GridItemHTMLElement | null>>>({});
  // reference of the gridstack object for modifications after initialization
  const gridRef = useRef<GridStack>(null);

  const board = useRequiredBoard();

  const currentLayoutId = useCurrentLayout();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentLayout = board.layouts.find((layout) => layout.id === currentLayoutId)!;
  const columnCount =
    section.kind === "dynamic" && "width" in section && typeof section.width === "number"
      ? section.width
      : currentLayout.columnCount;

  const itemRefKeys = Object.keys(itemRefs.current);
  // define items in itemRefs for easy access and reference to items
  if (itemRefKeys.length !== itemIds.length) {
    // Remove items that are not in the itemIds
    // Otherwise when an item is removed and then another item is added, this foreach below will not run.
    itemRefKeys.forEach((id) => {
      if (!itemIds.includes(id)) {
        delete itemRefs.current[id];
      }
    });
    itemIds.forEach((id) => {
      itemRefs.current[id] = itemRefs.current[id] ?? createRef();
    });
  }

  const onChange = useCallback(
    (changedNode: GridStackNode) => {
      const id = changedNode.el?.getAttribute("data-id");
      const type = changedNode.el?.getAttribute("data-type");

      if (!id || !type) return;

      if (type === "item") {
        // Updates the react-query state
        moveAndResizeItem({
          itemId: id,
          // We want the following properties to be null by default
          // so the next free position is used from the gridstack
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          xOffset: changedNode.x!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          yOffset: changedNode.y!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          width: changedNode.w!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          height: changedNode.h!,
        });
        return;
      }

      if (type === "section") {
        moveAndResizeInnerSection({
          innerSectionId: id,
          // We want the following properties to be null by default
          // so the next free position is used from the gridstack
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          xOffset: changedNode.x!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          yOffset: changedNode.y!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          width: changedNode.w!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          height: changedNode.h!,
        });
        return;
      }

      console.error(`Unknown grid-stack-item type to move. type='${type}' id='${id}'`);
    },
    [moveAndResizeItem, moveAndResizeInnerSection],
  );
  const onAdd = useCallback(
    (addedNode: GridStackNode) => {
      const id = addedNode.el?.getAttribute("data-id");
      const type = addedNode.el?.getAttribute("data-type");

      if (!id || !type) return;

      if (type === "item") {
        // Updates the react-query state
        moveItemToSection({
          itemId: id,
          sectionId: section.id,
          // We want the following properties to be null by default
          // so the next free position is used from the gridstack
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          xOffset: addedNode.x!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          yOffset: addedNode.y!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          width: addedNode.w!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          height: addedNode.h!,
        });
        return;
      }

      if (type === "section") {
        moveInnerSectionToSection({
          innerSectionId: id,
          sectionId: section.id,
          // We want the following properties to be null by default
          // so the next free position is used from the gridstack
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          xOffset: addedNode.x!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          yOffset: addedNode.y!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          width: addedNode.w!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          height: addedNode.h!,
        });
        return;
      }

      console.error(`Unknown grid-stack-item type to add. type='${type}' id='${id}'`);
    },
    [moveItemToSection, moveInnerSectionToSection, section.id],
  );

  // initialize the gridstack
  useEffect(() => {
    const isReady = initializeGridstack({
      section,
      itemIds,
      refs: {
        items: itemRefs,
        wrapper: wrapperRef,
        gridstack: gridRef,
      },
      sectionColumnCount: columnCount,
    });

    // If the section is ready mark it as ready
    // When all sections are ready the board is ready and will get visible
    if (isReady) {
      markAsReady(section.id);
    }

    // Only run this effect when the section items change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIds.length, columnCount]);

  /**
   * IMPORTANT: This effect has to be placed after the effect to initialize the gridstack
   * because we need the gridstack object to add the listeners
   */
  useEffect(() => {
    if (!isEditMode) return;
    const currentGrid = gridRef.current;
    // Add listener for moving items around in a wrapper
    currentGrid?.on("change", (_, nodes) => {
      nodes.forEach(onChange);

      // For all dynamic section items that changed we want to update the inner gridstack
      nodes
        .filter((node) => node.el?.getAttribute("data-type") === "section")
        .forEach((node) => {
          const dynamicInnerGrid = node.el?.querySelector<GridHTMLElement>('.grid-stack[data-kind="dynamic"]');

          if (!dynamicInnerGrid?.gridstack) return;

          handleResizeChange(
            dynamicInnerGrid as HTMLDivElement,
            dynamicInnerGrid.gridstack,
            node.w ?? 1,
            node.h ?? 1,
            true,
          );
        });
    });

    // Add listener for moving items in config from one wrapper to another
    currentGrid?.on("added", (_, nodes) => {
      nodes.forEach(onAdd);
    });

    return () => {
      currentGrid?.off("change");
      currentGrid?.off("added");
    };
  }, [isEditMode, onAdd, onChange]);

  /**
   * IMPORTANT: This effect has to be placed after the effect to initialize the gridstack
   * because we need the gridstack object to add the listeners
   * Toggle the gridstack to be static or not based on the edit mode
   */
  useEffect(() => {
    gridRef.current?.setStatic(!isEditMode);
  }, [isEditMode]);

  const sectionHeight = section.kind === "dynamic" && "height" in section ? (section.height as number) : null;

  /**
   * IMPORTANT: This effect has to be placed after the effect to initialize the gridstack
   * because we need the gridstack object to add the listeners
   * We want the amount of rows in a dynamic section to be the height of the section in the outer gridstack
   */
  useEffect(() => {
    if (!sectionHeight) return;
    gridRef.current?.row(sectionHeight);
  }, [sectionHeight]);

  /**
   * IMPORTANT: This effect has to be placed after the effect to initialize the gridstack
   * because we need the gridstack object to add the listeners
   */
  useCssVariableConfiguration({
    columnCount,
    gridRef,
    wrapperRef,
    width,
    height,
    isDynamic: section.kind === "dynamic",
  });

  return {
    refs: {
      items: itemRefs,
      wrapper: wrapperRef,
      gridstack: gridRef,
    },
  };
};

interface UseCssVariableConfiguration {
  gridRef: UseGridstackRefs["gridstack"];
  wrapperRef: UseGridstackRefs["wrapper"];
  width: number;
  height: number;
  columnCount: number;
  isDynamic: boolean;
}

/**
 * This hook is used to configure the css variables for the gridstack
 * Those css variables are used to define the size of the gridstack items
 * @see gridstack.scss
 * @param gridRef reference to the gridstack object
 * @param wrapperRef reference to the wrapper of the gridstack
 * @param width width of the section
 * @param height height of the section
 * @param columnCount column count of the gridstack
 */
const useCssVariableConfiguration = ({
  gridRef,
  wrapperRef,
  width,
  height,
  columnCount,
  isDynamic,
}: UseCssVariableConfiguration) => {
  const onResize = useCallback(() => {
    if (!wrapperRef.current) return;
    if (!gridRef.current) return;
    handleResizeChange(
      wrapperRef.current,
      gridRef.current,
      gridRef.current.getColumn(),
      gridRef.current.getRow(),
      isDynamic,
    );
  }, [wrapperRef, gridRef, isDynamic]);

  useCallback(() => {
    if (!wrapperRef.current) return;
    if (!gridRef.current) return;

    wrapperRef.current.style.setProperty("--gridstack-column-count", gridRef.current.getColumn().toString());
    wrapperRef.current.style.setProperty("--gridstack-row-count", gridRef.current.getRow().toString());

    let cellHeight = wrapperRef.current.clientWidth / gridRef.current.getColumn();
    if (isDynamic) {
      cellHeight = wrapperRef.current.clientHeight / gridRef.current.getRow();
    }

    gridRef.current.cellHeight(cellHeight);
  }, [wrapperRef, gridRef, isDynamic]);

  // Define widget-width by calculating the width of one column with mainRef width and column count
  useEffect(() => {
    onResize();
    if (typeof window === "undefined") return;
    window.addEventListener("resize", onResize);
    const wrapper = wrapperRef.current;
    wrapper?.addEventListener("resize", onResize);
    return () => {
      if (typeof window === "undefined") return;
      window.removeEventListener("resize", onResize);
      wrapper?.removeEventListener("resize", onResize);
    };
  }, [wrapperRef, gridRef, onResize]);

  // Handle resize of inner sections when there size changes
  useEffect(() => {
    onResize();
  }, [width, height, onResize]);

  // Define column count by using the sectionColumnCount
  useEffect(() => {
    wrapperRef.current?.style.setProperty("--gridstack-column-count", columnCount.toString());
  }, [columnCount, wrapperRef]);
};
