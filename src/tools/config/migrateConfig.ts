import { v4 as uuidv4 } from 'uuid';
import { AppType } from '../../types/app';
import { AreaType } from '../../types/area';
import { CategoryType } from '../../types/category';
import { ConfigType } from '../../types/config';
import { Config, serviceItem } from '../types';

export function migrateConfig(config: Config): ConfigType {
  const newConfig: ConfigType = {
    schemaVersion: 1,
    configProperties: {
      name: config.name ?? 'default',
    },
    categories: [],
    widgets: [],
    apps: [],
    settings: {
      common: {
        searchEngine: {
          type: 'google',
          properties: {
            enabled: true,
            openInNewTab: true,
          },
        },
        defaultConfig: 'default',
      },
      customization: {
        colors: {},
        layout: {
          enabledDocker: false,
          enabledLeftSidebar: false,
          enabledPing: false,
          enabledRightSidebar: false,
          enabledSearchbar: true,
        },
      },
    },
    wrappers: [
      {
        id: 'default',
        position: 1,
      },
    ],
  };

  config.services.forEach((service, index) => {
    const { category: categoryName } = service;

    if (!categoryName) {
      newConfig.apps.push(
        migrateService(service, index, {
          type: 'wrapper',
          properties: {
            id: 'default',
          },
        })
      );
      return;
    }

    const category = getConfigAndCreateIfNotExsists(newConfig, categoryName);

    if (!category) {
      return;
    }

    newConfig.apps.push(
      migrateService(service, index, { type: 'category', properties: { id: category.id } })
    );
  });

  return newConfig;
}

const getConfigAndCreateIfNotExsists = (
  config: ConfigType,
  categoryName: string
): CategoryType | null => {
  const foundCategory = config.categories.find((c) => c.name === categoryName);
  if (foundCategory) {
    return foundCategory;
  }

  const category: CategoryType = {
    id: uuidv4(),
    name: categoryName,
    position: 0,
  };

  config.categories.push(category);
  return category;
};

const getShapeForColumnCount = (index: number, columnCount: number) => ({
  location: {
    x: index % columnCount,
    y: Math.floor(index / columnCount),
  },
  size: {
    width: 1,
    height: 1,
  },
});

const migrateService = (
  oldService: serviceItem,
  serviceIndex: number,
  areaType: AreaType
): AppType => ({
  id: uuidv4(),
  name: oldService.name,
  url: oldService.url,
  behaviour: {
    isOpeningNewTab: oldService.newTab ?? true,
    externalUrl: oldService.openedUrl ?? '',
  },
  network: {
    enabledStatusChecker: oldService.ping ?? true,
    okStatus: oldService.status?.map((str) => parseInt(str, 10)) ?? [200],
  },
  appearance: {
    iconUrl: migrateIcon(oldService.icon),
  },
  integration: {
    type: null,
    properties: [],
  },
  area: areaType,
  shape: {
    lg: getShapeForColumnCount(serviceIndex, 12),
    md: getShapeForColumnCount(serviceIndex, 6),
    sm: getShapeForColumnCount(serviceIndex, 3),
  },
});

const migrateIcon = (iconUrl: string) => {
  if (iconUrl.startsWith('https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/')) {
    console.log('migrating icon:');
    const icon = iconUrl.split('/').at(-1);
    console.log(`${iconUrl} -> ${icon}`);
    return `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${icon}`;
  }

  return iconUrl;
};
