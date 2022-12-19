import { Card } from '@mantine/core';
import { RefObject } from 'react';
import { IWidgetDefinition } from '../../../../widgets/widgets';
import { Tiles } from '../../Tiles/tilesDefinitions';
import Widgets from '../../../../widgets';
import { GridstackTileWrapper } from '../../Tiles/TileWrapper';
import { useGridstack } from '../gridstack/use-gridstack';

interface DashboardSidebarProps {
  location: 'right' | 'left';
}

export const DashboardSidebar = ({ location }: DashboardSidebarProps) => {
  const { refs, items, widgets } = useGridstack('sidebar', location);

  const minRow = useMinRowForFullHeight(refs.wrapper);

  return (
    <Card
      withBorder
      w={300}
      style={{
        background: 'none',
        borderStyle: 'dashed',
      }}
    >
      <div
        className="grid-stack grid-stack-sidebar"
        style={{ transitionDuration: '0s', height: '100%' }}
        data-sidebar={location}
        gs-min-row={minRow}
        ref={refs.wrapper}
      >
        {items.map((app) => {
          const { component: TileComponent, ...tile } = Tiles['app'];
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
              <definition.component className="grid-stack-item-content" widget={widget} />
            </GridstackTileWrapper>
          );
        })}
      </div>
    </Card>
  );
};

const useMinRowForFullHeight = (wrapperRef: RefObject<HTMLDivElement>) => {
  return wrapperRef.current ? Math.floor(wrapperRef.current!.offsetHeight / 64) : 2;
};
