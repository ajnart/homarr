import { GridStackNode } from 'fily-publish-gridstack';

type GridstackColumnSortingFn = (
  column: number,
  prevColumn: number,
  newNodes: GridStackNode[],
  nodes: GridStackNode[]
) => void;

const getGridstackAttribute = (node: GridStackNode, path: 'x' | 'y' | 'w' | 'h'): number =>
  parseInt(node.el!.getAttribute(`data-gridstack-${path}`)!, 10);

const getGridstackAttributes = (node: GridStackNode) => ({
  width: getGridstackAttribute(node, 'w'),
  height: getGridstackAttribute(node, 'h'),
  x: getGridstackAttribute(node, 'x'),
  y: getGridstackAttribute(node, 'y'),
});

type Type = ReturnType<typeof getGridstackAttributes> & { node: GridStackNode };

const nextItem = (start: number, end: number, nodes: Type[]): number => {
  const next = nodes
    .filter((x) => x.y <= end && x.y + x.height - 1 > end)
    .sort((a, b) => a.y + a.height - (b.y + b.height))
    .at(0);
  if (!next) return end;
  return nextItem(start, next.height - 1 + next.y, nodes);
};

const nextRowHeight = (nodes: Type[], values: number[], current = 0) => {
  const item = nodes.find((x) => x.y >= current);
  if (!item) return;
  const next = nextItem(item.y, item.y + item.height - 1, nodes);
  values.push(next + 1 - item.y);
  nextRowHeight(nodes, values, next);
};

const getRowHeights = (nodes: Type[]) => {
  const rowHeights: number[] = [];
  nextRowHeight(
    nodes,
    rowHeights
  );
  return rowHeights;
};

const sortNodesByYAndX = (a: GridStackNode, b: GridStackNode) => {
  const aAttributes = getGridstackAttributes(a);
  const bAttributes = getGridstackAttributes(b);

  const differenceY = aAttributes.y - bAttributes.y;

  return differenceY !== 0 ? differenceY : aAttributes.x - bAttributes.x;
};

export const commonColumnSorting: GridstackColumnSortingFn = (
  column,
  prevColumn,
  newNodes,
  nodes
) => {
  if (column === prevColumn) {
    newNodes.concat(nodes);
    return;
  }

  let nextRow = 0;
  let available = column;

  const sortedNodes = nodes.sort(sortNodesByYAndX);
  const mappedNodes = sortedNodes.map((node) => ({
    ...getGridstackAttributes(node),
    node,
  }));
  const rowHeights = getRowHeights(mappedNodes);

  const rowItems: Type[][] = [];

  // TODO: fix issue with spaces between.
  let rowTotal = 0;
  rowHeights.forEach(height => {
    rowItems.push(mappedNodes.filter(node => node.y >= rowTotal && node.y < rowTotal + height));
    rowTotal += height;
  });

  console.log(rowItems);
};
