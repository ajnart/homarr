import { ConfigType } from '../../types/config';
import { Config } from '../types';

export function migrateConfig(config: Config): ConfigType {
  const newConfig: ConfigType = {
    schemaVersion: '1.0.0',
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

  newConfig.apps = config.services.map((s, idx) => ({
    name: s.name,
    id: s.id,
    url: s.url,
    behaviour: {
      isOpeningNewTab: s.newTab ?? true,
      externalUrl: s.openedUrl ?? '',
    },
    network: {
      enabledStatusChecker: s.ping ?? true,
      okStatus: s.status?.map((str) => parseInt(str, 10)) ?? [200],
    },
    appearance: {
      iconUrl: s.icon,
    },
    integration: {
      type: null,
      properties: [],
    },
    area: {
      type: 'wrapper',
      properties: {
        id: 'default',
      },
    },
    shape: {
      location: {
        x: (idx * 3) % 18,
        y: Math.floor((idx / 6)) * 3,
      },
      size: {
        width: 3,
        height: 3,
      },
    },
  }));

  return newConfig;
}
