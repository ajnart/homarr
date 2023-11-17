import { getAppsForSectionsAsync } from '../db/app';

type MapApp = Awaited<ReturnType<typeof getAppsForSectionsAsync>>[number];

export const mapApp = (appItem: MapApp) => {
  const { sectionId, itemId, id, ...commonLayoutItem } = appItem.layout;
  const common = { ...commonLayoutItem, id: itemId };
  const { id: _id, statusCodes, itemId: _itemId, ...app } = appItem.app;
  return {
    ...common,
    ...app,
    kind: 'app' as const,
    statusCodes: statusCodes.map((x) => x.code),
  };
};
