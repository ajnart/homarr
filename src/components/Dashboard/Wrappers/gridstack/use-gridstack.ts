import {
  GridItemHTMLElement,
  GridStack,
  GridStackElement,
  GridStackNode,
} from 'fily-publish-gridstack';
import {
  MutableRefObject,
  RefObject,
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Section, useRequiredBoard } from '~/components/Board/context';
import { useItemActions } from '~/components/Board/item-actions';

import { useEditModeStore } from '../../Views/useEditModeStore';
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
  const board = useRequiredBoard();
  const { moveAndResizeItem, moveItemToSection } = useItemActions({ boardName: board.name });
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
      itemRefs.current[id] = itemRefs.current[id] || createRef();
    });
  }

  useEffect(() => {
    if (section.type === 'sidebar' || !mainAreaWidth) return;
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

  const onChange = useCallback(
    (changedNode: GridStackNode) => {
      if (!isEditMode) return;

      const itemType = changedNode.el?.getAttribute('data-type');
      const itemId = changedNode.el?.getAttribute('data-id');
      if (!itemType || !itemId) return;

      // Updates the config and defines the new position of the item
      moveAndResizeItem({
        itemId,
        x: changedNode.x!,
        y: changedNode.y!,
        width: changedNode.w!,
        height: changedNode.h!,
      });
    },
    [isEditMode]
  );

  const onAdd = useCallback(
    (addedNode: GridStackNode) => {
      if (!isEditMode) return;

      const itemType = addedNode.el?.getAttribute('data-type');
      const itemId = addedNode.el?.getAttribute('data-id');
      if (!itemType || !itemId) return;

      moveItemToSection({
        itemId,
        sectionId: section.id,
        x: addedNode.x!,
        y: addedNode.y!,
        width: addedNode.w!,
        height: addedNode.h!,
      });
    },
    [isEditMode]
  );

  // initialize the gridstack
  useEffect(() => {
    initializeGridstack({
      events: {
        onChange,
        onAdd,
      },
      isEditMode,
      section,
      refs: {
        items: itemRefs,
        wrapper: wrapperRef,
        gridstack: gridRef,
      },
      sectionColumnCount,
    });

    // Remove event listeners on unmount
    return () => {
      gridRef.current?.off('change');
      gridRef.current?.off('added');
    };
  }, [items, wrapperRef.current, sectionColumnCount]);

  return {
    refs: {
      items: itemRefs,
      wrapper: wrapperRef,
      gridstack: gridRef,
    },
  };
};
