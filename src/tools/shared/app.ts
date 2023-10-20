import { v4 as uuidv4 } from 'uuid';
import { AppItem } from '~/components/Board/context';
import { AppType } from '~/types/app';

export const generateDefaultApp2 = (): AppItem => {
  const appId = uuidv4();
  return {
    id: appId,
    type: 'app',
    name: 'Your app',
    internalUrl: 'https://homarr.dev',
    externalUrl: 'https://homarr.dev',
    iconUrl: '/imgs/logo/logo.png',
    nameStyle: 'normal',
    namePosition: 'top',
    nameLineClamp: 1,
    fontSize: 16,
    isPingEnabled: true,
    statusCodes: [200, 301, 302, 304, 307, 308],
    openInNewTab: true,
    description: null,
    height: 1,
    width: 1,
    x: 0,
    y: 0,
  };
};

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
