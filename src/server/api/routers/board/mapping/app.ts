import { getAppsForSectionsAsync } from '../db/app';

type MapApp = Awaited<ReturnType<typeof getAppsForSectionsAsync>>[number];

export const mapApp = (appItem: MapApp) => {
  const { sectionId, itemId, id, ...commonLayoutItem } = appItem.item.layouts.at(0)!;
  const common = { ...commonLayoutItem, id: itemId };
  const { id: _id, statusCodes, itemId: _itemId, item, ...app } = appItem;
  return {
    ...common,
    ...app,
    kind: 'app' as const,
    statusCodes: statusCodes.map((x) => x.code),
  };
};
