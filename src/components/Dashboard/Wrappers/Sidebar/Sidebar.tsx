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
  const { refs, items, integrations } = useGridstack('sidebar', location);

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
        {Object.entries(integrations).map(([k, v]) => {
          const widget = Widgets[k as keyof typeof Widgets] as IWidgetDefinition | undefined;
          if (!widget) return null;

          return (
            <GridstackTileWrapper
              type="module"
              key={k}
              itemRef={refs.items.current[k]}
              id={widget.id}
              {...widget.gridstack}
              {...v.shape.location}
              {...v.shape.size}
            >
              <widget.component className="grid-stack-item-content" module={v} />
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
