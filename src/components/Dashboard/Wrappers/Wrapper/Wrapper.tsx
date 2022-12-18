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
      {items?.map((service) => {
        const { component: TileComponent, ...tile } = Tiles['service'];
        return (
          <GridstackTileWrapper
            id={service.id}
            type="service"
            key={service.id}
            itemRef={refs.items.current[service.id]}
            {...tile}
            {...service.shape.location}
            {...service.shape.size}
          >
            <TileComponent className="grid-stack-item-content" service={service} />
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
