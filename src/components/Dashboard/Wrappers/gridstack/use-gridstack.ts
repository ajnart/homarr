import { GridStack, GridStackNode } from 'fily-publish-gridstack';
import {
  createRef,
  MutableRefObject,
  RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { useResize } from '../../../../hooks/use-resize';
import { AppType } from '../../../../types/app';
import { IWidget } from '../../../../widgets/widgets';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { initializeGridstack } from './init-gridstack';

interface UseGristackReturnType {
  apps: AppType[];
  widgets: IWidget<string, any>[];
  refs: {
    wrapper: RefObject<HTMLDivElement>;
    items: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>;
    gridstack: MutableRefObject<GridStack | undefined>;
  };
}

export const useGridstack = (
  areaType: 'wrapper' | 'category' | 'sidebar',
  areaId: string
): UseGristackReturnType => {
  const isEditMode = useEditModeStore((x) => x.enabled);
  const { config, name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);
  // define reference for wrapper - is used to calculate the width of the wrapper
  const wrapperRef = useRef<HTMLDivElement>(null);
  // references to the diffrent items contained in the gridstack
  const itemRefs = useRef<Record<string, RefObject<HTMLDivElement>>>({});
  // reference of the gridstack object for modifications after initialization
  const gridRef = useRef<GridStack>();
  // width of the wrapper (updating on page resize)
  const { width, height } = useResize(wrapperRef);

  const items = useMemo(
    () =>
      config?.apps.filter(
        (x) =>
          x.area.type === areaType &&
          (x.area.type === 'sidebar'
            ? x.area.properties.location === areaId
            : x.area.properties.id === areaId)
      ) ?? [],
    [config]
  );
  const widgets = useMemo(() => {
    if (!config) return [];
    return config.widgets.filter(
      (w) =>
        w.area.type === areaType &&
        (w.area.type === 'sidebar'
          ? w.area.properties.location === areaId
          : w.area.properties.id === areaId)
    );
  }, [config]);

  // define items in itemRefs for easy access and reference to items
  if (Object.keys(itemRefs.current).length !== items.length + (widgets ?? []).length) {
    items.forEach(({ id }: { id: keyof typeof itemRefs.current }) => {
      itemRefs.current[id] = itemRefs.current[id] || createRef();
    });
    (widgets ?? []).forEach(({ id }) => {
      itemRefs.current[id] = itemRefs.current[id] || createRef();
    });
  }

  // change column count depending on the width and the gridRef
  useEffect(() => {
    if (areaType === 'sidebar') return;
    gridRef.current?.column(Math.floor(width / 64), 'moveScale');
  }, [gridRef, width]);

  const onChange = isEditMode
    ? (changedNode: GridStackNode) => {
        if (!configName) return;

        const itemType = changedNode.el?.getAttribute('data-type');
        const itemId = changedNode.el?.getAttribute('data-id');
        if (!itemType || !itemId) return;

        // Updates the config and defines the new position of the item
        updateConfig(configName, (previous) => {
          const currentItem =
            itemType === 'app'
              ? previous.apps.find((x) => x.id === itemId)
              : previous.widgets.find((x) => x.id === itemId);
          if (!currentItem) return previous;

          currentItem.shape = {
            location: {
              x: changedNode.x ?? currentItem.shape.location.x,
              y: changedNode.y ?? currentItem.shape.location.y,
            },
            size: {
              width: changedNode.w ?? currentItem.shape.size.width,
              height: changedNode.h ?? currentItem.shape.size.height,
            },
          };

          if (itemType === 'app') {
            return {
              ...previous,
              apps: [
                ...previous.apps.filter((x) => x.id !== itemId),
                { ...(currentItem as AppType) },
              ],
            };
          }

          return {
            ...previous,
            widgets: [
              ...previous.widgets.filter((x) => x.id !== itemId),
              { ...(currentItem as IWidget<string, any>) },
            ],
          };
        });
      }
    : () => {};

  const onAdd = isEditMode
    ? (addedNode: GridStackNode) => {
        if (!configName) return;

        const itemType = addedNode.el?.getAttribute('data-type');
        const itemId = addedNode.el?.getAttribute('data-id');
        if (!itemType || !itemId) return;

        // Updates the config and defines the new position and wrapper of the item
        updateConfig(configName, (previous) => {
          const currentItem =
            itemType === 'app'
              ? previous.apps.find((x) => x.id === itemId)
              : previous.widgets.find((x) => x.id === itemId);
          if (!currentItem) return previous;

          if (areaType === 'sidebar') {
            currentItem.area = {
              type: areaType,
              properties: {
                location: areaId as 'right' | 'left',
              },
            };
          } else {
            currentItem.area = {
              type: areaType,
              properties: {
                id: areaId,
              },
            };
          }

          currentItem.shape = {
            location: {
              x: addedNode.x ?? currentItem.shape.location.x,
              y: addedNode.y ?? currentItem.shape.location.y,
            },
            size: {
              width: addedNode.w ?? currentItem.shape.size.width,
              height: addedNode.h ?? currentItem.shape.size.height,
            },
          };

          if (itemType === 'app') {
            return {
              ...previous,
              apps: [
                ...previous.apps.filter((x) => x.id !== itemId),
                { ...(currentItem as AppType) },
              ],
            };
          }

          return {
            ...previous,
            widgets: [
              ...previous.widgets.filter((x) => x.id !== itemId),
              { ...(currentItem as IWidget<string, any>) },
            ],
          };
        });
      }
    : () => {};

  // initialize the gridstack
  useLayoutEffect(() => {
    initializeGridstack(
      areaType,
      wrapperRef,
      gridRef,
      itemRefs,
      areaId,
      items,
      widgets ?? [],
      isEditMode,
      {
        onChange,
        onAdd,
      }
    );
  }, [items.length, wrapperRef.current, (widgets ?? []).length]);

  return {
    apps: items,
    widgets: widgets ?? [],
    refs: {
      items: itemRefs,
      wrapper: wrapperRef,
      gridstack: gridRef,
    },
  };
};
