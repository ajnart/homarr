import { BackendConfigType } from '../../types/config';

export const getFallbackConfig = (name?: string): BackendConfigType => ({
  schemaVersion: 1,
  configProperties: {
    name: name ?? 'default',
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
      position: 0,
    },
  ],
});
