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
  const { refs, items, widgets } = useGridstack('wrapper', wrapper.id);

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
  );
};
