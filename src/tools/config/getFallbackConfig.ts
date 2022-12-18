import { BackendConfigType } from '../../types/config';

export const getFallbackConfig = (name?: string): BackendConfigType => ({
  schemaVersion: '1.0.0',
  configProperties: {
    name: name ?? 'default',
  },
  categories: [],
  integrations: {},
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
        enabledDocker: true,
        enabledLeftSidebar: true,
        enabledPing: true,
        enabledRightSidebar: true,
        enabledSearchbar: true,
      },
    },
  },
  wrappers: [],
});
