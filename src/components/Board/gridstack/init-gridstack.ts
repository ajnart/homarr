import { GridItemHTMLElement, GridStack, GridStackNode } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject } from 'react';
import { Item, Section } from '~/components/Board/context';

type InitializeGridstackProps = {
  section: Section;
  refs: {
    wrapper: RefObject<HTMLDivElement>;
    items: MutableRefObject<Record<string, RefObject<GridItemHTMLElement>>>;
    gridstack: MutableRefObject<GridStack | undefined>;
  };
  isEditMode: boolean;
  sectionColumnCount: number;
};

export const initializeGridstack = ({
  section,
  refs,
  isEditMode,
  sectionColumnCount,
}: InitializeGridstackProps) => {
  if (!refs.wrapper.current) return;
  // calculates the currently available count of columns
  const columnCount = section.type === 'sidebar' ? 2 : sectionColumnCount;
  const minRow =
    section.type !== 'sidebar' ? 1 : Math.floor(refs.wrapper.current.offsetHeight / 128);
  // initialize gridstack
  const newGrid = refs.gridstack;
  newGrid.current = GridStack.init(
    {
      column: columnCount,
      margin: section.type === 'sidebar' ? 5 : 10,
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
    `.grid-stack-${section.type}[data-${section.type}='${section.id}']`
  );
  const grid = newGrid.current;
  if (!grid) return;
  // Must be used to update the column count after the initialization
  grid.column(columnCount, 'none');

  grid.batchUpdate();
  grid.removeAll(false);
  section.items.forEach((item) => {
    const ref = refs.items.current[item.id]?.current;
    setAttributesFromShape(ref, item);
    ref && grid.makeWidget(ref);
  });
  grid.batchUpdate(false);
};

function setAttributesFromShape(ref: GridItemHTMLElement | null, item: Item) {
  if (!item || !ref) return;
  ref.setAttribute('gs-x', item.x.toString());
  ref.setAttribute('gs-y', item.y.toString());
  ref.setAttribute('gs-w', item.width.toString());
  ref.setAttribute('gs-h', item.height.toString());
}

export type ItemWithUnknownLocation = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  type: 'app' | 'widget';
  id: string;
};
