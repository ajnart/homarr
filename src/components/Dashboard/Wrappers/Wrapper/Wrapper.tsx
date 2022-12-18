import { WrapperType } from '../../../../types/wrapper';
import { Tiles } from '../../Tiles/tilesDefinitions';
import { GridstackTileWrapper } from '../../Tiles/TileWrapper';
import { useGridstack } from '../gridstack/use-gridstack';

interface DashboardWrapperProps {
  wrapper: WrapperType;
}

export const DashboardWrapper = ({ wrapper }: DashboardWrapperProps) => {
  const { refs, items, integrations } = useGridstack('wrapper', wrapper.id);

  return (
    <div
      className="grid-stack grid-stack-wrapper"
      style={{ transitionDuration: '0s' }}
      data-wrapper={wrapper.id}
      ref={refs.wrapper}
    >
      {items?.map((app) => {
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
        const { component: TileComponent, ...tile } = Tiles[k as keyof typeof Tiles];

        return (
          <GridstackTileWrapper
            id={k}
            type="module"
            key={k}
            itemRef={refs.items.current[k]}
            {...tile}
            {...v.shape.location}
            {...v.shape.size}
          >
            <TileComponent className="grid-stack-item-content" module={v} />
          </GridstackTileWrapper>
        );
      })}
    </div>
  );
};
