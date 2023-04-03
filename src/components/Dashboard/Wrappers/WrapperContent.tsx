import { MutableRefObject, RefObject } from 'react';
import { GridStack } from 'fily-publish-gridstack';

import { AppType } from '../../../types/app';
import Widgets from '../../../widgets';
import { WidgetWrapper } from '../../../widgets/WidgetWrapper';
import { IWidget, IWidgetDefinition } from '../../../widgets/widgets';
import { appTileDefinition } from '../Tiles/Apps/AppTile';
import { GridstackTileWrapper } from '../Tiles/TileWrapper';
import { useGridstackStore } from './gridstack/store';

interface WrapperContentProps {
  apps: AppType[];
  widgets: IWidget<string, any>[];
  refs: {
    wrapper: RefObject<HTMLDivElement>;
    items: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>;
    gridstack: MutableRefObject<GridStack | undefined>;
  };
}

export function WrapperContent({ apps, refs, widgets }: WrapperContentProps) {
  const shapeSize = useGridstackStore((x) => x.currentShapeSize);

  if (!shapeSize) return null;

  return (
    <>
      {apps?.map((app) => {
        const { component: TileComponent, ...tile } = appTileDefinition;
        const item = refs.items.current[app.id] as RefObject<HTMLDivElement>;
        return (
          <GridstackTileWrapper
            id={app.id}
            type="app"
            key={app.id}
            itemRef={item}
            {...tile}
            {...(app.shape[shapeSize]?.location ?? {})}
            {...(app.shape[shapeSize]?.size ?? {})}
          >
            <TileComponent className="grid-stack-item-content" app={app} />
          </GridstackTileWrapper>
        );
      })}
      {widgets.map((widget) => {
        const definition = Widgets[widget.id as keyof typeof Widgets] as
          | IWidgetDefinition
          | undefined;
        if (!definition) return null;
        const item = refs.items.current[widget.id] as RefObject<HTMLDivElement>;
        return (
          <GridstackTileWrapper
            type="widget"
            key={widget.id}
            itemRef={item}
            id={definition.id}
            {...definition.gridstack}
            {...widget.shape[shapeSize]?.location}
            {...widget.shape[shapeSize]?.size}
          >
            <WidgetWrapper
              className="grid-stack-item-content"
              widget={widget}
              widgetId={widget.id}
              WidgetComponent={definition.component}
            />
          </GridstackTileWrapper>
        );
      })}
    </>
  );
}
