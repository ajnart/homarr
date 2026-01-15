export interface GridAlgorithmItem {
  id: string;
  type: "item" | "section";
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  sectionId: string;
}

interface GridAlgorithmInput {
  items: GridAlgorithmItem[];
  width: number;
  previousWidth: number;
  sectionId: string;
}

interface GridAlgorithmOutput {
  height: number;
  items: GridAlgorithmItem[];
}

export const generateResponsiveGridFor = ({
  items,
  previousWidth,
  width,
  sectionId,
}: GridAlgorithmInput): GridAlgorithmOutput => {
  const itemsOfCurrentSection = items
    .filter((item) => item.sectionId === sectionId)
    .sort((itemA, itemB) =>
      itemA.yOffset === itemB.yOffset ? itemA.xOffset - itemB.xOffset : itemA.yOffset - itemB.yOffset,
    );
  const normalizedItems = normalizeItems(itemsOfCurrentSection, width);

  if (itemsOfCurrentSection.length === 0) {
    return {
      height: 0,
      items: [],
    };
  }

  const newItems: GridAlgorithmItem[] = [];

  // Fix height of dynamic sections
  const dynamicSectionHeightMap = new Map<string, number>();
  const dynamicSectionsOfCurrentSection = normalizedItems.filter((item) => item.type === "section");
  for (const dynamicSection of dynamicSectionsOfCurrentSection) {
    const result = generateResponsiveGridFor({
      items,
      previousWidth: dynamicSection.previousWidth,
      width: dynamicSection.width,
      sectionId: dynamicSection.id,
    });
    newItems.push(...result.items);
    dynamicSectionHeightMap.set(dynamicSection.id, result.height);
  }

  // Return same positions for items in the current section
  if (width >= previousWidth) {
    return {
      height: Math.max(...itemsOfCurrentSection.map((item) => item.yOffset + item.height)),
      items: newItems.concat(normalizedItems),
    };
  }

  const occupied2d: boolean[][] = [];

  for (const item of normalizedItems) {
    const itemWithHeight = {
      ...item,
      height: item.type === "section" ? Math.max(dynamicSectionHeightMap.get(item.id) ?? 1, item.height) : item.height,
    };
    const position = nextFreeSpot(occupied2d, itemWithHeight, width);
    if (!position) throw new Error("No free spot available");

    addItemToOccupied(occupied2d, itemWithHeight, position, width);
    newItems.push({
      ...itemWithHeight,
      xOffset: position.x,
      yOffset: position.y,
    });
  }

  return {
    height: occupied2d.length,
    items: newItems,
  };
};

/**
 * Reduces the width of the items to fit the new column count.
 * @param items items to normalize
 * @param columnCount new column count
 */
const normalizeItems = (items: GridAlgorithmItem[], columnCount: number) => {
  return items.map((item) => ({ ...item, previousWidth: item.width, width: Math.min(columnCount, item.width) }));
};

/**
 * Adds the item to the occupied spots.
 * @param occupied2d array of occupied spots
 * @param item item to place
 * @param position position to place the item
 */
const addItemToOccupied = (
  occupied2d: boolean[][],
  item: GridAlgorithmItem,
  position: { x: number; y: number },
  columnCount: number,
) => {
  for (let yOffset = 0; yOffset < item.height; yOffset++) {
    let row = occupied2d[position.y + yOffset];
    if (!row) {
      addRow(occupied2d, columnCount);
      // After adding it, it must exist
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      row = occupied2d[position.y + yOffset]!;
    }

    for (let xOffset = 0; xOffset < item.width; xOffset++) {
      row[position.x + xOffset] = true;
    }
  }
};

/**
 * Adds a new row to the grid.
 * @param occupied2d array of occupied spots
 * @param columnCount column count of section
 */
const addRow = (occupied2d: boolean[][], columnCount: number) => {
  occupied2d.push(new Array<boolean>(columnCount).fill(false));
};

/**
 * Searches for the next free spot in the grid.
 * @param occupied2d array of occupied spots
 * @param item item to place
 * @param columnCount column count of section
 * @returns the position of the next free spot or null if no spot is available
 */
const nextFreeSpot = (occupied2d: boolean[][], item: GridAlgorithmItem, columnCount: number) => {
  for (let offsetY = 0; offsetY < 99999; offsetY++) {
    for (let offsetX = 0; offsetX < columnCount; offsetX++) {
      if (hasHorizontalSpace(columnCount, item, offsetX) && isFree(occupied2d, item, { x: offsetX, y: offsetY })) {
        return { x: offsetX, y: offsetY };
      }
    }
  }

  return null;
};

/**
 * Check if the item fits into the grid horizontally.
 * @param columnCount available width
 * @param item item to place
 * @param offsetX current x position
 * @returns true if the item fits horizontally
 */
const hasHorizontalSpace = (columnCount: number, item: GridAlgorithmItem, offsetX: number) => {
  return offsetX + item.width <= columnCount;
};

/**
 * Check if the spot is free.
 * @param occupied2d array of occupied spots
 * @param item item to place
 * @param position position to check
 * @returns true if the spot is free
 */
const isFree = (occupied2d: boolean[][], item: GridAlgorithmItem, position: { x: number; y: number }) => {
  for (let yOffset = 0; yOffset < item.height; yOffset++) {
    const row = occupied2d[position.y + yOffset];
    if (!row) return true; // Empty row is free

    for (let xOffset = 0; xOffset < item.width; xOffset++) {
      if (row[position.x + xOffset]) {
        return false;
      }
    }
  }

  return true;
};
