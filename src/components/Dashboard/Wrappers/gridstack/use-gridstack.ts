import { GridStack, GridStackNode } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject, createRef, useEffect, useMemo, useRef } from 'react';
import { Item, Section } from '~/components/Board/context';
import { useConfigContext } from '~/config/provider';
import { useConfigStore } from '~/config/store';
import { AppType } from '~/types/app';
import { AreaType } from '~/types/area';
import { IWidget } from '~/widgets/widgets';

import { useEditModeStore } from '../../Views/useEditModeStore';
import { TileWithUnknownLocation, initializeGridstack } from './init-gridstack';
import { useGridstackStore, useWrapperColumnCount } from './store';

interface UseGristackReturnType {
  refs: {
    wrapper: RefObject<HTMLDivElement>;
    items: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>;
    gridstack: MutableRefObject<GridStack | undefined>;
  };
}

type UseGridstackProps = {
  section: Section;
};

export const useGridstack = ({ section }: UseGridstackProps): UseGristackReturnType => {
  const isEditMode = useEditModeStore((x) => x.enabled);
  const updateConfig = useConfigStore((x) => x.updateConfig);
  // define reference for wrapper - is used to calculate the width of the wrapper
  const wrapperRef = useRef<HTMLDivElement>(null);
  // references to the diffrent items contained in the gridstack
  const itemRefs = useRef<Record<string, RefObject<HTMLDivElement>>>({});
  // reference of the gridstack object for modifications after initialization
  const gridRef = useRef<GridStack>();
  const wrapperColumnCount = useWrapperColumnCount();
  const shapeSize = useGridstackStore((x) => x.currentShapeSize);
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);
  // width of the wrapper (updating on page resize)
  const root: HTMLHtmlElement = useMemo(() => document.querySelector(':root')!, []);

  if (!mainAreaWidth || !shapeSize || !wrapperColumnCount) {
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
    if (section.type === 'sidebar') return;
    const widgetWidth = mainAreaWidth / wrapperColumnCount;
    // widget width is used to define sizes of gridstack items within global.scss
    root.style.setProperty('--gridstack-widget-width', widgetWidth.toString());
    gridRef.current?.cellHeight(widgetWidth);
  }, [mainAreaWidth, wrapperColumnCount, gridRef.current]);

  useEffect(() => {
    // column count is used to define count of columns of gridstack within global.scss
    root.style.setProperty('--gridstack-column-count', wrapperColumnCount.toString());
  }, [wrapperColumnCount]);

  const configName = 'default';
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

          currentItem.shape[shapeSize] = {
            location: {
              x: changedNode.x!,
              y: changedNode.y!,
            },
            size: {
              width: changedNode.w!,
              height: changedNode.h!,
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
        updateConfig(
          configName,
          (previous) => {
            const currentItem =
              itemType === 'app'
                ? previous.apps.find((x) => x.id === itemId)
                : previous.widgets.find((x) => x.id === itemId);
            if (!currentItem) return previous;

            if (section.type === 'sidebar') {
              currentItem.area = {
                type: section.type,
                properties: {
                  location: section.position,
                },
              };
            } else {
              currentItem.area = {
                type: section.type as any,
                properties: {
                  id: section.id,
                },
              };
            }

            currentItem.shape[shapeSize] = {
              location: {
                x: addedNode.x!,
                y: addedNode.y!,
              },
              size: {
                width: addedNode.w!,
                height: addedNode.h!,
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
          },
          (prev, curr) => {
            const isApp = itemType === 'app';

            if (isApp) {
              const currItem = curr.apps.find((x) => x.id === itemId);
              const prevItem = prev.apps.find((x) => x.id === itemId);
              if (!currItem || !prevItem) return false;

              return (
                currItem.area.type !== prevItem.area.type ||
                Object.entries(currItem.area.properties).some(
                  ([key, value]) =>
                    prevItem.area.properties[key as keyof AreaType['properties']] !== value
                )
              );
            }

            const currItem = curr.widgets.find((x) => x.id === itemId);
            const prevItem = prev.widgets.find((x) => x.id === itemId);
            if (!currItem || !prevItem) return false;

            return (
              currItem.area.type !== prevItem.area.type ||
              Object.entries(currItem.area.properties).some(
                ([key, value]) =>
                  prevItem.area.properties[key as keyof AreaType['properties']] !== value
              )
            );
          }
        );
      }
    : () => {};

  // initialize the gridstack
  useEffect(() => {
    const removeEventHandlers = () => {
      gridRef.current?.off('change');
      gridRef.current?.off('added');
    };

    const tilesWithUnknownLocation: TileWithUnknownLocation[] = [];
    initializeGridstack(
      section.type as any,
      wrapperRef,
      gridRef,
      itemRefs,
      section.id,
      items,
      isEditMode,
      wrapperColumnCount,
      shapeSize,
      tilesWithUnknownLocation,
      {
        onChange,
        onAdd,
      }
    );
    if (!configName) return removeEventHandlers;
    updateConfig(configName, (prev) => ({
      ...prev,
      apps: prev.apps.map((app) => {
        const currentUnknownLocation = tilesWithUnknownLocation.find(
          (x) => x.type === 'app' && x.id === app.id
        );
        if (!currentUnknownLocation) return app;

        return {
          ...app,
          shape: {
            ...app.shape,
            [shapeSize]: {
              location: {
                x: currentUnknownLocation.x,
                y: currentUnknownLocation.y,
              },
              size: {
                width: currentUnknownLocation.w,
                height: currentUnknownLocation.h,
              },
            },
          },
        };
      }),
      widgets: prev.widgets.map((widget) => {
        const currentUnknownLocation = tilesWithUnknownLocation.find(
          (x) => x.type === 'widget' && x.id === widget.id
        );
        if (!currentUnknownLocation) return widget;

        return {
          ...widget,
          shape: {
            ...widget.shape,
            [shapeSize]: {
              location: {
                x: currentUnknownLocation.x,
                y: currentUnknownLocation.y,
              },
              size: {
                width: currentUnknownLocation.w,
                height: currentUnknownLocation.h,
              },
            },
          },
        };
      }),
    }));
    return removeEventHandlers;
  }, [items, wrapperRef.current, wrapperColumnCount]);

  return {
    refs: {
      items: itemRefs,
      wrapper: wrapperRef,
      gridstack: gridRef,
    },
  };
};
