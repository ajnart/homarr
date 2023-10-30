import { GridStack } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject } from 'react';
import { AppType } from '~/types/app';
import { WidgetWrapper } from '~/widgets/WidgetWrapper';
import { IWidget, IWidgetDefinition } from '~/widgets/widgets';

import Widgets from '../../../widgets';
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
        return (
          <GridstackTileWrapper
            id={app.id}
            type="app"
            key={app.id}
            itemRef={refs.items.current[app.id]}
            {...tile}
            {...(app.shape[shapeSize]?.location ?? {})}
            {...(app.shape[shapeSize]?.size ?? {})}
          >
            <TileComponent className="grid-stack-item-content" app={app} />
          </GridstackTileWrapper>
        );
      })}
      {widgets.map((widget) => {
        const definition = Widgets[widget.type as keyof typeof Widgets] as
          | IWidgetDefinition
          | undefined;
        if (!definition) return null;

        return (
          <GridstackTileWrapper
            type="widget"
            key={widget.id}
            itemRef={refs.items.current[widget.id]}
            id={widget.id}
            {...definition.gridstack}
            {...widget.shape[shapeSize]?.location}
            {...widget.shape[shapeSize]?.size}
          >
            <WidgetWrapper
              className="grid-stack-item-content"
              widget={widget}
              widgetType={widget.type}
              WidgetComponent={definition.component}
            />
          </GridstackTileWrapper>
        );
      })}
    </>
  );
}
