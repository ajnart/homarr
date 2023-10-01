import { GridStack } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject, useMemo } from 'react';
import { AppItem, Item, WidgetItem } from '~/components/Board/context';
import { AppType } from '~/types/app';
import { WidgetWrapper } from '~/widgets/WidgetWrapper';
import { IWidget, IWidgetDefinition } from '~/widgets/widgets';

import Widgets from '../../../widgets';
import { appTileDefinition } from '../Tiles/Apps/AppTile';
import { GridstackTileWrapper } from '../Tiles/TileWrapper';
import { useGridstackStore } from './gridstack/store';

interface WrapperContentProps {
  items: Item[];
  refs: {
    wrapper: RefObject<HTMLDivElement>;
    items: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>;
    gridstack: MutableRefObject<GridStack | undefined>;
  };
}

export function WrapperContent({ items, refs }: WrapperContentProps) {
  const apps = useMemo(() => items.filter((x): x is AppItem => x.type === 'app'), [items]);
  const widgets = useMemo(() => items.filter((x): x is WidgetItem => x.type === 'widget'), [items]);

  return (
    <>
      {apps?.map((app) => {
        const { component: TileComponent, ...tile } = appTileDefinition;
        return (
          <GridstackTileWrapper
            id={app.id}
            type="app"
            key={app.id}
            itemRef={refs.items.current[app.id]}
            {...tile}
            x={app.x}
            y={app.y}
            width={app.width}
            height={app.height}
          >
            <TileComponent className="grid-stack-item-content" app={app} />
          </GridstackTileWrapper>
        );
      })}
      {widgets.map((widget) => {
        const definition = Widgets[widget.sort];
        if (!definition) return null;

        return (
          <GridstackTileWrapper
            type="widget"
            key={widget.id}
            itemRef={refs.items.current[widget.id]}
            id={widget.id}
            {...definition.gridstack}
            x={widget.x}
            y={widget.y}
            width={widget.width}
            height={widget.height}
          >
            <WidgetWrapper
              className="grid-stack-item-content"
              widget={widget}
              widgetType={widget.sort}
              WidgetComponent={definition.component as any}
            />
          </GridstackTileWrapper>
        );
      })}
    </>
  );
}
