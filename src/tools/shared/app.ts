import { v4 as uuidv4 } from 'uuid';
import { AppType } from '~/types/app';

export const generateDefaultApp = (wrapperId: string): AppType =>
  ({
    id: uuidv4(),
    name: 'Your app',
    url: 'https://homarr.dev',
    appearance: {
      iconUrl: '/imgs/logo/logo.png',
      appNameStatus: 'normal',
      positionAppName: 'column',
      lineClampAppName: 1,
      appNameFontSize: 16,
    },
    network: {
      enabledStatusChecker: true,
      statusCodes: ['200', '301', '302', '304', '307', '308'],
      okStatus: [200, 301, 302, 304, 307, 308],
    },
    behaviour: {
      isOpeningNewTab: true,
      externalUrl: 'https://homarr.dev',
    },
    area: {
      type: 'wrapper',
      properties: {
        id: wrapperId,
      },
    },
    shape: {},
    integration: {
      type: null,
      properties: [],
    },
  }) satisfies AppType;
