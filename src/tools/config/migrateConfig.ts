import Consola from 'consola';
import { v4 as uuidv4 } from 'uuid';
import { AppIntegrationType, AppType, IntegrationType } from '../../types/app';
import { AreaType } from '../../types/area';
import { CategoryType } from '../../types/category';
import { ConfigType } from '../../types/config';
import { IBitTorrent } from '../../widgets/bitTorrent/BitTorrentTile';
import { IDashDotTile } from '../../widgets/dashDot/DashDotTile';
import { IDateWidget } from '../../widgets/date/DateTile';
import { ITorrentNetworkTraffic } from '../../widgets/torrentNetworkTraffic/TorrentNetworkTrafficTile';
import { IWeatherWidget } from '../../widgets/weather/WeatherTile';
import { IWidget } from '../../widgets/widgets';
import { Config, serviceItem } from '../types';

export function migrateConfig(config: Config): ConfigType {
  const newConfig: ConfigType = {
    schemaVersion: 1,
    configProperties: {
      name: config.name ?? 'default',
    },
    categories: [],
    widgets: migrateModules(config),
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
        colors: {
          primary: config.settings.primaryColor ?? 'red',
          secondary: config.settings.secondaryColor ?? 'orange',
          shade: config.settings.primaryShade ?? 7,
        },
        layout: {
          enabledDocker: config.modules.docker?.enabled ?? false,
          enabledLeftSidebar: false,
          enabledPing: config.modules.ping?.enabled ?? false,
          enabledRightSidebar: false,
          enabledSearchbar: config.modules.search?.enabled ?? true,
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

  config.services.forEach((service) => {
    const { category: categoryName } = service;

    if (!categoryName) {
      newConfig.apps.push(
        migrateService(service, {
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
      migrateService(service, { type: 'category', properties: { id: category.id } })
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
    position: config.categories.length,
  };

  config.categories.push(category);
  return category;
};

const migrateService = (oldService: serviceItem, areaType: AreaType): AppType => ({
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
  integration: migrateIntegration(oldService),
  area: areaType,
  shape: {},
});

const migrateModules = (config: Config): IWidget<string, any>[] => {
  const moduleKeys = Object.keys(config.modules);
  return moduleKeys
    .map((moduleKey): IWidget<string, any> | null => {
      const oldModule = config.modules[moduleKey];

      if (!oldModule.enabled) {
        return null;
      }

      switch (moduleKey.toLowerCase()) {
        case 'torrent-status':
        case 'Torrent':
          return {
            id: uuidv4(),
            properties: {
              refreshInterval: 10,
              displayCompletedTorrents: oldModule.options?.hideComplete?.value ?? false,
              displayStaleTorrents: true,
            },
            area: {
              type: 'wrapper',
              properties: {
                id: 'default',
              },
            },
            shape: {},
          } as IBitTorrent;
        case 'weather':
          return {
            id: uuidv4(),
            properties: {
              displayInFahrenheit: oldModule.options?.freedomunit?.value ?? false,
              location: oldModule.options?.location?.value ?? 'Paris',
            },
            area: {
              type: 'wrapper',
              properties: {
                id: 'default',
              },
            },
            shape: {},
          } as IWeatherWidget;
        case 'dashdot':
        case 'Dash.':
          return {
            id: uuidv4(),
            properties: {
              url: oldModule.options?.url?.value ?? '',
              cpuMultiView: oldModule.options?.cpuMultiView?.value ?? false,
              storageMultiView: oldModule.options?.storageMultiView?.value ?? false,
              useCompactView: oldModule.options?.useCompactView?.value ?? false,
              graphs: oldModule.options?.graphs?.value ?? ['cpu', 'ram'],
            },
            area: {
              type: 'wrapper',
              properties: {
                id: 'default',
              },
            },
            shape: {},
          } as IDashDotTile;
        case 'date':
          return {
            id: uuidv4(),
            properties: {
              display24HourFormat: oldModule.options?.full?.value ?? true,
            },
            area: {
              type: 'wrapper',
              properties: {
                id: 'default',
              },
            },
            shape: {},
          } as IDateWidget;
        case 'Download Speed':
        case 'dlspeed':
          return {
            id: uuidv4(),
            properties: {},
            area: {
              type: 'wrapper',
              properties: {
                id: 'default',
              },
            },
            shape: {},
          } as ITorrentNetworkTraffic;
        default:
          Consola.error(`Failed to map unknown module type ${moduleKey} to new type definitions.`);
          return null;
      }
    })
    .filter((x) => x !== null) as IWidget<string, any>[];
};

const migrateIcon = (iconUrl: string) => {
  if (iconUrl.startsWith('https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/')) {
    const icon = iconUrl.split('/').at(-1);
    Consola.warn(
      `Detected legacy icon repository. Upgrading to replacement repository: ${iconUrl} -> ${icon}`
    );
    return `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${icon}`;
  }

  return iconUrl;
};

const migrateIntegration = (oldService: serviceItem): AppIntegrationType => {
  const logInformation = (newType: IntegrationType) => {
    Consola.info(`Migrated integration ${oldService.type} to the new type ${newType}`);
  };
  switch (oldService.type) {
    case 'Deluge':
      logInformation('deluge');
      return {
        type: 'deluge',
        properties: [
          {
            field: 'password',
            isDefined: oldService.password !== undefined,
            type: 'private',
            value: oldService.password,
          },
        ],
      };
    case 'Jellyseerr':
      logInformation('jellyseerr');
      return {
        type: 'jellyseerr',
        properties: [
          {
            field: 'apiKey',
            isDefined: oldService.apiKey !== undefined,
            type: 'private',
            value: oldService.apiKey,
          },
        ],
      };
    case 'Overseerr':
      logInformation('overseerr');
      return {
        type: 'overseerr',
        properties: [
          {
            field: 'apiKey',
            isDefined: oldService.apiKey !== undefined,
            type: 'private',
            value: oldService.apiKey,
          },
        ],
      };
    case 'Lidarr':
      logInformation('lidarr');
      return {
        type: 'lidarr',
        properties: [
          {
            field: 'apiKey',
            isDefined: oldService.apiKey !== undefined,
            type: 'private',
            value: oldService.apiKey,
          },
        ],
      };
    case 'Radarr':
      logInformation('radarr');
      return {
        type: 'radarr',
        properties: [
          {
            field: 'apiKey',
            isDefined: oldService.apiKey !== undefined,
            type: 'private',
            value: oldService.apiKey,
          },
        ],
      };
    case 'Readarr':
      logInformation('readarr');
      return {
        type: 'readarr',
        properties: [
          {
            field: 'apiKey',
            isDefined: oldService.apiKey !== undefined,
            type: 'private',
            value: oldService.apiKey,
          },
        ],
      };
    case 'Sabnzbd':
      logInformation('sabnzbd');
      return {
        type: 'sabnzbd',
        properties: [
          {
            field: 'apiKey',
            isDefined: oldService.apiKey !== undefined,
            type: 'private',
            value: oldService.apiKey,
          },
        ],
      };
    case 'Sonarr':
      logInformation('sonarr');
      return {
        type: 'sonarr',
        properties: [
          {
            field: 'apiKey',
            isDefined: oldService.apiKey !== undefined,
            type: 'private',
            value: oldService.apiKey,
          },
        ],
      };
    case 'NZBGet':
      logInformation('nzbGet');
      return {
        type: 'nzbGet',
        properties: [
          {
            field: 'username',
            isDefined: oldService.username !== undefined,
            type: 'private',
            value: oldService.username,
          },
          {
            field: 'password',
            isDefined: oldService.password !== undefined,
            type: 'private',
            value: oldService.password,
          },
        ],
      };
    case 'qBittorrent':
      logInformation('qBittorrent');
      return {
        type: 'qBittorrent',
        properties: [
          {
            field: 'username',
            isDefined: oldService.username !== undefined,
            type: 'private',
            value: oldService.username,
          },
          {
            field: 'password',
            isDefined: oldService.password !== undefined,
            type: 'private',
            value: oldService.password,
          },
        ],
      };
    case 'Transmission':
      logInformation('transmission');
      return {
        type: 'transmission',
        properties: [
          {
            field: 'username',
            isDefined: oldService.username !== undefined,
            type: 'private',
            value: oldService.username,
          },
          {
            field: 'password',
            isDefined: oldService.password !== undefined,
            type: 'private',
            value: oldService.password,
          },
        ],
      };
    default:
      Consola.warn(
        `Integration type of service ${oldService.name} could not be mapped to new integration type definition`
      );
      return {
        type: null,
        properties: [],
      };
  }
};
