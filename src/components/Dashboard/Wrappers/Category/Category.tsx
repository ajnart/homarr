import { Card, Group, Title } from '@mantine/core';
import { CategoryType } from '../../../../types/category';
import { IWidgetDefinition } from '../../../../widgets/widgets';
import { HomarrCardWrapper } from '../../Tiles/HomarrCardWrapper';
import { Tiles } from '../../Tiles/tilesDefinitions';
import Widgets from '../../../../widgets';
import { GridstackTileWrapper } from '../../Tiles/TileWrapper';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { useGridstack } from '../gridstack/use-gridstack';
import { CategoryEditMenu } from './CategoryEditMenu';

interface DashboardCategoryProps {
  category: CategoryType;
}

export const DashboardCategory = ({ category }: DashboardCategoryProps) => {
  const { refs, items, widgets } = useGridstack('category', category.id);
  const isEditMode = useEditModeStore((x) => x.enabled);

  return (
    <HomarrCardWrapper pt={10} mx={10}>
      <Group position="apart" align="center">
        <Title order={3}>{category.name}</Title>
        {isEditMode ? <CategoryEditMenu category={category} /> : null}
      </Group>
      <div
        className="grid-stack grid-stack-category"
        style={{ transitionDuration: '0s' }}
        data-category={category.id}
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
    </HomarrCardWrapper>
  );
};
