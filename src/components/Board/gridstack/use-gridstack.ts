import { type GridItemHTMLElement, GridStack, type GridStackNode } from 'fily-publish-gridstack';
import {
  type MutableRefObject,
  type RefObject,
  createRef,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useItemActions } from '~/components/Board/Items/item-actions';
import { type Section } from '~/components/Board/context';

import { useEditModeStore } from '../useEditModeStore';
import { initializeGridstack } from './init-gridstack';
import { useGridstackStore, useWrapperColumnCount } from './store';

interface UseGristackReturnType {
  refs: {
    wrapper: RefObject<HTMLDivElement>;
    items: MutableRefObject<Record<string, RefObject<GridItemHTMLElement>>>;
    gridstack: MutableRefObject<GridStack | undefined>;
  };
}

type UseGridstackProps = {
  section: Section;
};

export const useGridstack = ({ section }: UseGridstackProps): UseGristackReturnType => {
  const isEditMode = useEditModeStore((x) => x.enabled);
  const { moveAndResizeItem, moveItemToSection } = useItemActions();
  // define reference for wrapper - is used to calculate the width of the wrapper
  const wrapperRef = useRef<HTMLDivElement>(null);
  // references to the diffrent items contained in the gridstack
  const itemRefs = useRef<Record<string, RefObject<GridItemHTMLElement>>>({});
  // reference of the gridstack object for modifications after initialization
  const gridRef = useRef<GridStack>();
  const sectionColumnCount = useWrapperColumnCount();
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);
  // width of the wrapper (updating on page resize)
  const root = useMemo(() => {
    if (typeof document === 'undefined') return;
    return document.querySelector(':root')! as HTMLHtmlElement;
  }, [typeof document]);

  if (/*!mainAreaWidth ||*/ !sectionColumnCount) {
    throw new Error('UseGridstack should not be executed before mainAreaWidth has been set!');
  }

  const items = useMemo(() => section.items, [section.items.length]);

  // define items in itemRefs for easy access and reference to items
  if (Object.keys(itemRefs.current).length !== items.length) {
    items.forEach(({ id }: { id: keyof typeof itemRefs.current }) => {
      itemRefs.current[id] = itemRefs.current[id] ?? createRef();
    });
  }

  useEffect(() => {
    if (section.kind === 'sidebar' || !mainAreaWidth) return;
    const widgetWidth = mainAreaWidth / sectionColumnCount;
    // widget width is used to define sizes of gridstack items within global.scss
    root?.style.setProperty('--gridstack-widget-width', widgetWidth.toString());
    gridRef.current?.cellHeight(widgetWidth);
  }, [mainAreaWidth, sectionColumnCount, gridRef.current]);

  useEffect(() => {
    // column count is used to define count of columns of gridstack within global.scss
    root?.style.setProperty('--gridstack-column-count', sectionColumnCount.toString());
  }, [sectionColumnCount]);

  useEffect(() => {
    gridRef.current?.setStatic(!isEditMode);
  }, [isEditMode]);

  const onChange = (changedNode: GridStackNode) => {
    const itemType = changedNode.el?.getAttribute('data-type');
    const itemId = changedNode.el?.getAttribute('data-id');
    if (!itemType || !itemId) return;

    // Updates the react-query state
    moveAndResizeItem({
      itemId,
      x: changedNode.x!,
      y: changedNode.y!,
      width: changedNode.w!,
      height: changedNode.h!,
    });
  };
  const onAdd = (addedNode: GridStackNode) => {
    const itemType = addedNode.el?.getAttribute('data-type');
    const itemId = addedNode.el?.getAttribute('data-id');
    if (!itemType || !itemId) return;

    // Updates the react-query state
    moveItemToSection({
      itemId,
      sectionId: section.id,
      x: addedNode.x!,
      y: addedNode.y!,
      width: addedNode.w!,
      height: addedNode.h!,
    });
  };

  useEffect(() => {
    if (!isEditMode) return;
    // Add listener for moving items around in a wrapper
    gridRef.current?.on('change', (_, nodes) => {
      (nodes as GridStackNode[]).forEach(onChange);
    });

    // Add listener for moving items in config from one wrapper to another
    gridRef.current?.on('added', (_, el) => {
      const nodes = el as GridStackNode[];
      nodes.forEach((n) => onAdd(n));
    });

    return () => {
      gridRef.current?.off('change');
      gridRef.current?.off('added');
    };
  }, [isEditMode]);

  // initialize the gridstack
  useEffect(() => {
    initializeGridstack({
      isEditMode,
      section,
      refs: {
        items: itemRefs,
        wrapper: wrapperRef,
        gridstack: gridRef,
      },
      sectionColumnCount,
    });
  }, [items.length, wrapperRef.current, sectionColumnCount]);

  return {
    refs: {
      items: itemRefs,
      wrapper: wrapperRef,
      gridstack: gridRef,
    },
  };
};
