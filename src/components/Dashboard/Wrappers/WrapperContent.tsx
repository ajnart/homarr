import { GridStack } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject } from 'react';
import { AppType } from '../../../types/app';
import Widgets from '../../../widgets';
import { IWidget, IWidgetDefinition } from '../../../widgets/widgets';
import { WidgetWrapper } from '../../../widgets/WidgetWrapper';
import { Tiles } from '../Tiles/tilesDefinitions';
import { GridstackTileWrapper } from '../Tiles/TileWrapper';

interface WrapperContentProps {
  apps: AppType[];
  widgets: IWidget<string, any>[];
  refs: {
    wrapper: RefObject<HTMLDivElement>;
    items: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>;
    gridstack: MutableRefObject<GridStack | undefined>;
    updateGridstackRef: MutableRefObject<(() => void) | undefined>;
  };
}

export const WrapperContent = ({ apps, refs, widgets }: WrapperContentProps) => (
  <>
    {apps?.map((app) => {
      const { component: TileComponent, ...tile } = Tiles.app;
      return (
        <GridstackTileWrapper
          id={app.id}
          type="app"
          key={app.id}
          itemRef={refs.items.current[app.id]}
          {...tile}
          {...app.shape.location}
          {...app.shape.size}
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

      return (
        <GridstackTileWrapper
          type="widget"
          key={widget.id}
          itemRef={refs.items.current[widget.id]}
          id={definition.id}
          {...definition.gridstack}
          {...widget.shape.location}
          {...widget.shape.size}
        >
          <WidgetWrapper className="grid-stack-item-content" widget={widget} widgetId={widget.id}>
            <definition.component className="grid-stack-item-content" widget={widget} />
          </WidgetWrapper>
        </GridstackTileWrapper>
      );
    })}
  </>
);
