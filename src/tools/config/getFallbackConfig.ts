import { ConfigType } from '../../types/config';

export const getFallbackConfig = (name?: string): ConfigType => ({
  schemaVersion: '1.0.0',
  configProperties: {
    name: name ?? 'default',
  },
  categories: [],
  integrations: {},
  services: [],
  settings: {
    common: {
      searchEngine: {
        type: 'google',
      },
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
