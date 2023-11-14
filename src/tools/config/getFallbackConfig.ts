import { ConfigType } from '~/types/config';

import defaultConfig from '../../../data/default.json';

export const getFallbackConfig = (name?: string) => ({
  ...defaultConfig,
  configProperties: {
    name: name ?? 'default',
  },
});

export const getStaticFallbackConfig = (name: string): ConfigType => ({
  schemaVersion: 1,
  configProperties: {
    name: name,
  },
  categories: [
    {
      id: '47af36c0-47c1-4e5b-bfc7-ad645ee6a33f',
      position: 1,
      name: 'Welcome to Homarr 🎉',
    },
  ],
  wrappers: [
    {
      id: 'default',
      position: 0,
    },
    {
      id: '47af36c0-47c1-4e5b-bfc7-ad645ee6a326',
      position: 1,
    },
  ],
  apps: [],
  widgets: [],
  settings: {
    access: {
      allowGuests: false,
    },
    common: {
      searchEngine: {
        type: 'google',
        properties: {
          enabled: true,
          openInNewTab: true,
        },
      },
    },
    customization: {
      layout: {
        enabledLeftSidebar: false,
        enabledRightSidebar: false,
        enabledDocker: false,
        enabledPing: false,
        enabledSearchbar: true,
      },
      accessibility: {
        disablePingPulse: false,
        replacePingDotsWithIcons: false,
      },
      pageTitle: 'Homarr ⭐️',
      logoImageUrl: '/imgs/logo/logo.png',
      faviconUrl: '/imgs/favicon/favicon-squared.png',
      backgroundImageUrl: '',
      customCss: '',
      colors: {
        primary: 'red',
        secondary: 'yellow',
        shade: 7,
      },
      appOpacity: 100,
    },
  },
});
