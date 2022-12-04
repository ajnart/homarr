import { GridStack, GridStackNode } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject } from 'react';
import { IntegrationsType } from '../../../../types/integration';
import { ServiceType } from '../../../../types/service';

export const initializeGridstack = (
  areaType: 'wrapper' | 'category' | 'sidebar',
  wrapperRef: RefObject<HTMLDivElement>,
  gridRef: MutableRefObject<GridStack | undefined>,
  itemRefs: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>,
  areaId: string,
  items: ServiceType[],
  integrations: IntegrationsType,
  isEditMode: boolean,
  events: {
    onChange: (changedNode: GridStackNode) => void;
    onAdd: (addedNode: GridStackNode) => void;
  }
) => {
  if (!wrapperRef.current) return;
  // calculates the currently available count of columns
  const columnCount = areaType === 'sidebar' ? 4 : Math.floor(wrapperRef.current.offsetWidth / 64);
  const minRow = areaType !== 'sidebar' ? 1 : Math.floor(wrapperRef.current.offsetHeight / 64);
  // initialize gridstack
  gridRef.current = GridStack.init(
    {
      column: columnCount,
      margin: 10,
      cellHeight: 64,
      float: true,
      alwaysShowResizeHandle: 'mobile',
      acceptWidgets: true,
      disableOneColumnMode: true,
      staticGrid: !isEditMode,
      minRow,
    },
    // selector of the gridstack item (it's eather category or wrapper)
    `.grid-stack-${areaType}[data-${areaType}='${areaId}']`
  );
  const grid = gridRef.current;

  // Add listener for moving items around in a wrapper
  grid.on('change', (_, el) => {
    const nodes = el as GridStackNode[];
    const firstNode = nodes.at(0);
    if (!firstNode) return;
    events.onChange(firstNode);
  });

  // Add listener for moving items in config from one wrapper to another
  grid.on('added', (_, el) => {
    const nodes = el as GridStackNode[];
    const firstNode = nodes.at(0);
    if (!firstNode) return;
    events.onAdd(firstNode);
  });
  grid.batchUpdate();
  grid.removeAll(false);
  items.forEach(
    ({ id }) =>
      itemRefs.current[id] && grid.makeWidget(itemRefs.current[id].current as HTMLDivElement)
  );
  Object.keys(integrations).forEach(
    (key) =>
      itemRefs.current[key] && grid.makeWidget(itemRefs.current[key].current as HTMLDivElement)
  );
  grid.batchUpdate(false);
};
