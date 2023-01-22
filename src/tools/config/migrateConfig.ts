import Consola from 'consola';
import { v4 as uuidv4 } from 'uuid';
import { ConfigAppIntegrationType, ConfigAppType, IntegrationType } from '../../types/app';
import { AreaType } from '../../types/area';
import { CategoryType } from '../../types/category';
import { BackendConfigType } from '../../types/config';
import { SearchEngineCommonSettingsType } from '../../types/settings';
import { ICalendarWidget } from '../../widgets/calendar/CalendarTile';
import { IDashDotTile } from '../../widgets/dashDot/DashDotTile';
import { IDateWidget } from '../../widgets/date/DateTile';
import { ITorrent } from '../../widgets/torrent/TorrentTile';
import { ITorrentNetworkTraffic } from '../../widgets/torrentNetworkTraffic/TorrentNetworkTrafficTile';
import { IUsenetWidget } from '../../widgets/useNet/UseNetTile';
import { IWeatherWidget } from '../../widgets/weather/WeatherTile';
import { IWidget } from '../../widgets/widgets';
import { Config, serviceItem } from '../types';

export function migrateConfig(config: Config): BackendConfigType {
  const newConfig: BackendConfigType = {
    schemaVersion: 1,
    configProperties: {
      name: config.name ?? 'default',
    },
    categories: [],
    widgets: migrateModules(config).filter(widget => widget !== null),
    apps: [],
    settings: {
      common: {
        searchEngine: migrateSearchEngine(config),
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
        position: 0,
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

  Consola.info('Migrator converted a configuration with the old schema to the new schema');

  return newConfig;
}

const migrateSearchEngine = (config: Config): SearchEngineCommonSettingsType => {
  switch (config.settings.searchUrl) {
    case 'https://bing.com/search?q=':
      return {
        type: 'bing',
        properties: {
          enabled: true,
          openInNewTab: true,
        },
      };
    case 'https://google.com/search?q=':
      return {
        type: 'google',
        properties: {
          enabled: true,
          openInNewTab: true,
        },
      };
    case 'https://duckduckgo.com/?q=':
      return {
        type: 'duckDuckGo',
        properties: {
          enabled: true,
          openInNewTab: true,
        },
      };
    default:
      return {
        type: 'custom',
        properties: {
          enabled: true,
          openInNewTab: true,
          template: config.settings.searchUrl,
        },
      };
  }
};

const getConfigAndCreateIfNotExsists = (
  config: BackendConfigType,
  categoryName: string
): CategoryType | null => {
  const foundCategory = config.categories.find((c) => c.name === categoryName);
  if (foundCategory) {
    return foundCategory;
  }

  const category: CategoryType = {
    id: uuidv4(),
    name: categoryName,
    position: config.categories.length + 1, // sync up with index of categories
  };

  config.categories.push(category);

  // sync up with categories
  if (config.wrappers.length < config.categories.length) {
    config.wrappers.push({
      id: uuidv4(),
      position: config.wrappers.length + 1, // sync up with index of categories
    });
  }

  return category;
};

const migrateService = (oldService: serviceItem, areaType: AreaType): ConfigAppType => ({
  id: uuidv4(),
  name: oldService.name,
  url: oldService.url,
  behaviour: {
    isOpeningNewTab: oldService.newTab ?? true,
    externalUrl: oldService.openedUrl ?? '',
  },
  network: {
    enabledStatusChecker: oldService.ping ?? true,
    statusCodes: oldService.status?.map((str) => parseInt(str, 10)) ?? [200],
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
            id: 'torrents-status',
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
          } as ITorrent;
        case 'weather':
          return {
            id: 'weather',
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
        case 'Dash.': {
          const oldDashDotService = config.services.find((service) => service.type === 'Dash.');
          return {
            id: 'dashdot',
            properties: {
              url: oldModule.options?.url?.value ?? oldDashDotService?.url ?? '',
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
        }
        case 'date':
          return {
            id: 'date',
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
        case 'Download Speed' || 'dlspeed':
          return {
            id: 'dlspeed',
            properties: {},
            area: {
              type: 'wrapper',
              properties: {
                id: 'default',
              },
            },
            shape: {},
          } as ITorrentNetworkTraffic;
        case 'calendar':
          return {
            id: 'calendar',
            properties: {},
            area: {
              type: 'wrapper',
              properties: {
                id: 'default',
              },
            },
            shape: {},
          } as ICalendarWidget;
        case 'usenet':
          return {
            id: 'usenet',
            properties: {},
            area: {
              type: 'wrapper',
              properties: {
                id: 'default',
              },
            },
            shape: {},
          } as IUsenetWidget;
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

const migrateIntegration = (oldService: serviceItem): ConfigAppIntegrationType => {
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
            type: 'private',
            value: oldService.username,
          },
          {
            field: 'password',
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
            type: 'private',
            value: oldService.username,
          },
          {
            field: 'password',
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
            type: 'private',
            value: oldService.username,
          },
          {
            field: 'password',
            type: 'private',
            value: oldService.password,
          },
        ],
      };
    case 'Other':
      return {
        type: null,
        properties: [],
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
