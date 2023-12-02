import { GridItemHTMLElement, GridStack, GridStackNode } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject } from 'react';
import { AppType } from '~/types/app';
import { ShapeType } from '~/types/shape';
import { IWidget } from '~/widgets/widgets';

export const initializeGridstack = (
  areaType: 'wrapper' | 'category' | 'sidebar',
  wrapperRef: RefObject<HTMLDivElement>,
  gridRef: MutableRefObject<GridStack | undefined>,
  itemRefs: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>,
  areaId: string,
  items: AppType[],
  widgets: IWidget<string, any>[],
  isEditMode: boolean,
  wrapperColumnCount: number,
  shapeSize: 'sm' | 'md' | 'lg',
  tilesWithUnknownLocation: TileWithUnknownLocation[],
  events: {
    onChange: (changedNode: GridStackNode) => void;
    onAdd: (addedNode: GridStackNode) => void;
  }
) => {
  if (!wrapperRef.current) return;
  // calculates the currently available count of columns
  const columnCount = areaType === 'sidebar' ? 2 : wrapperColumnCount;
  const minRow = areaType !== 'sidebar' ? 1 : Math.floor(wrapperRef.current.offsetHeight / 128);
  // initialize gridstack
  const newGrid = gridRef;
  newGrid.current = GridStack.init(
    {
      column: columnCount,
      margin: areaType === 'sidebar' ? 5 : 10,
      cellHeight: 128,
      float: true,
      alwaysShowResizeHandle: 'mobile',
      acceptWidgets: true,
      disableOneColumnMode: true,
      staticGrid: !isEditMode,
      minRow,
      animate: false,
    },
    // selector of the gridstack item (it's eather category or wrapper)
    `.grid-stack-${areaType}[data-${areaType}='${areaId}']`
  );
  const grid = newGrid.current;
  // Must be used to update the column count after the initialization
  grid.column(columnCount, 'none');

  // Add listener for moving items around in a wrapper
  grid.on('change', (_, el) => {
    const nodes = el as GridStackNode[];
    if (!nodes) return;
    const firstNode = nodes.at(0);
    if (!firstNode) return;
    events.onChange(firstNode);
  });

  // Add listener for moving items in config from one wrapper to another
  grid.on('added', (_, el) => {
    const nodes = el as GridStackNode[];
    if (!nodes) return;
    const firstNode = nodes.at(0);
    if (!firstNode) return;
    events.onAdd(firstNode);
  });

  grid.batchUpdate();
  grid.removeAll(false);
  items.forEach(({ id, shape }) => {
    const item = itemRefs.current[id]?.current;
    setAttributesFromShape(item, shape[shapeSize]);
    item && grid.makeWidget(item as HTMLDivElement);
    if (!shape[shapeSize] && item) {
      const gridItemElement = item as GridItemHTMLElement;
      if (gridItemElement.gridstackNode) {
        const { x, y, w, h } = gridItemElement.gridstackNode;
        tilesWithUnknownLocation.push({ x, y, w, h, type: 'app', id });
      }
    }
  });
  widgets.forEach(({ id, shape }) => {
    const item = itemRefs.current[id]?.current;
    setAttributesFromShape(item, shape[shapeSize]);
    item && grid.makeWidget(item as HTMLDivElement);
    if (!shape[shapeSize] && item) {
      const gridItemElement = item as GridItemHTMLElement;
      if (gridItemElement.gridstackNode) {
        const { x, y, w, h } = gridItemElement.gridstackNode;
        tilesWithUnknownLocation.push({ x, y, w, h, type: 'widget', id });
      }
    }
  });
  grid.batchUpdate(false);
};

function setAttributesFromShape(ref: HTMLDivElement | null, sizedShape: ShapeType['lg']) {
  if (!sizedShape || !ref) return;
  ref.setAttribute('gs-x', sizedShape.location.x.toString());
  ref.setAttribute('gs-y', sizedShape.location.y.toString());
  ref.setAttribute('gs-w', sizedShape.size.width.toString());
  ref.setAttribute('gs-h', sizedShape.size.height.toString());
}

export type TileWithUnknownLocation = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  type: 'app' | 'widget';
  id: string;
};
