import { getWidgetsForSectionsAsync } from '../db/widget';
import { mapWidgetOptions } from './options';

export type MapWidget = Awaited<ReturnType<typeof getWidgetsForSectionsAsync>>[number];

export const mapWidget = (widgetItem: MapWidget) => {
  const { sectionId, itemId, id, ...commonLayoutItem } = widgetItem.item.layouts.at(0)!;
  const common = { ...commonLayoutItem, id: itemId };
  const { id: _id, itemId: _itemId, sort, item, options, integrations, ...widget } = widgetItem;
  return {
    ...common,
    ...widget,
    kind: 'widget' as const,
    sort,
    options: mapWidgetOptions(options),
    integrations: integrations.map((x) => ({
      ...x.integration,
    })),
  };
};
