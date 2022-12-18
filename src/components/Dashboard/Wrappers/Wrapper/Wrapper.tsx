import { WrapperType } from '../../../../types/wrapper';
import Widgets from '../../../../widgets';
import { IWidget, IWidgetDefinition } from '../../../../widgets/widgets';
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
  );
};
