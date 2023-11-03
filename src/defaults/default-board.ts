import { ConfigType } from '~/types/config';

export const defaultBoard: ConfigType = {
  schemaVersion: 1,
  configProperties: {
    name: 'default',
  },
  categories: [],
  wrappers: [
    {
      id: 'default',
      position: 0,
    },
  ],
  apps: [
    {
      id: '5df743d9-5cb1-457c-85d2-64ff86855652',
      name: 'Documentation',
      url: 'https://homarr.dev',
      behaviour: {
        externalUrl: 'https://homarr.dev',
        isOpeningNewTab: true,
      },
      network: {
        enabledStatusChecker: false,
        statusCodes: ['200'],
      },
      appearance: {
        iconUrl: '/imgs/logo/logo.png',
        appNameStatus: 'normal',
        positionAppName: 'column',
        lineClampAppName: 1,
        appNameFontSize: 16,
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
        md: {
          location: {
            x: 5,
            y: 1,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        sm: {
          location: {
            x: 0,
            y: 1,
          },
          size: {
            width: 1,
            height: 2,
          },
        },
        lg: {
          location: {
            x: 6,
            y: 1,
          },
          size: {
            width: 2,
            height: 2,
          },
        },
      },
    },
    {
      id: '47af36c0-47c1-4e5b-bfc7-ad645ee6a337',
      name: 'Discord',
      url: 'https://discord.com/invite/aCsmEV5RgA',
      behaviour: {
        isOpeningNewTab: true,
        externalUrl: 'https://discord.com/invite/aCsmEV5RgA',
        tooltipDescription: "Join our Discord server! We're waiting for your ideas and feedback. ",
      },
      network: {
        enabledStatusChecker: false,
        statusCodes: ['200'],
      },
      appearance: {
        iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/discord.png',
        appNameStatus: 'normal',
        positionAppName: 'row-reverse',
        lineClampAppName: 1,
        appNameFontSize: 16,
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
        md: {
          location: {
            x: 3,
            y: 1,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        sm: {
          location: {
            x: 1,
            y: 4,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        lg: {
          location: {
            x: 4,
            y: 0,
          },
          size: {
            width: 2,
            height: 1,
          },
        },
      },
    },
    {
      id: '47af36c0-47c1-4e5b-bfc7-ad645ee6a330',
      name: 'Contribute',
      url: 'https://github.com/ajnart/homarr',
      behaviour: {
        externalUrl: 'https://github.com/ajnart/homarr',
        isOpeningNewTab: true,
        tooltipDescription: '',
      },
      network: {
        enabledStatusChecker: false,
        statusCodes: [],
      },
      appearance: {
        iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/github.png',
        appNameStatus: 'normal',
        positionAppName: 'row-reverse',
        lineClampAppName: 2,
        appNameFontSize: 16,
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
        md: {
          location: {
            x: 3,
            y: 2,
          },
          size: {
            width: 2,
            height: 1,
          },
        },
        sm: {
          location: {
            x: 1,
            y: 3,
          },
          size: {
            width: 2,
            height: 1,
          },
        },
        lg: {
          location: {
            x: 2,
            y: 0,
          },
          size: {
            width: 2,
            height: 1,
          },
        },
      },
    },
    {
      id: '47af36c0-47c1-4e5b-bfc7-ad645ee6a990',
      name: 'Donate',
      url: 'https://ko-fi.com/ajnart',
      behaviour: {
        externalUrl: 'https://ko-fi.com/ajnart',
        isOpeningNewTab: true,
        tooltipDescription: 'Please consider making a donation',
      },
      network: {
        enabledStatusChecker: false,
        statusCodes: ['200'],
      },
      appearance: {
        iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/ko-fi.png',
        appNameStatus: 'normal',
        positionAppName: 'row-reverse',
        lineClampAppName: 1,
        appNameFontSize: 16,
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
        md: {
          location: {
            x: 4,
            y: 1,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        sm: {
          location: {
            x: 2,
            y: 4,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        lg: {
          location: {
            x: 6,
            y: 0,
          },
          size: {
            width: 2,
            height: 1,
          },
        },
      },
    },
  ],
  widgets: [
    {
      id: '86b1921f-efa7-410f-92dd-79553bf3264d',
      type: 'notebook',
      properties: {
        showToolbar: true,
        content:
          '<h2><strong>Homarr\'s</strong> notebook</h2><p>Use it as your Todo list, ideas to think about, as a "getting-started" guide for your users or even as your secret journal to confess your crushes, it stays private our your <strong>Homarr</strong> instance.</p><p>The <code>notebook</code> widget focuses on usability and is designed to be as simple as possible to bring a familiar editing experience to regular users. It is based on <a target="_blank" rel="noopener noreferrer nofollow" href="https://tiptap.dev/">Tiptap.dev</a> and supports all of its features:</p><ul><li><p>General text formatting: <strong>bold</strong>, <em>italic</em>, underline, <s>strike-through</s></p></li><li><p>Headings (h1-h6)</p></li><li><p>Sub and super scripts (&lt;sup /&gt; and &lt;sub /&gt; tags)</p></li><li><p>Ordered and bullet lists</p></li><li><p>Text align</p></li></ul>',
      },
      area: {
        type: 'wrapper',
        properties: {
          id: 'default',
        },
      },
      shape: {
        sm: {
          location: {
            x: 0,
            y: 0,
          },
          size: {
            width: 3,
            height: 2,
          },
        },
        md: {
          location: {
            x: 0,
            y: 0,
          },
          size: {
            width: 3,
            height: 4,
          },
        },
        lg: {
          location: {
            x: 0,
            y: 1,
          },
          size: {
            width: 6,
            height: 3,
          },
        },
      },
    },
    {
      id: 'e3004052-6b83-480e-b458-56e8ccdca5f0',
      type: 'weather',
      properties: {
        displayInFahrenheit: false,
        location: {
          name: 'Paris',
          latitude: 48.85341,
          longitude: 2.3488,
        },
        displayCityName: true,
      },
      area: {
        type: 'wrapper',
        properties: {
          id: 'default',
        },
      },
      shape: {
        md: {
          location: {
            x: 5,
            y: 0,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        sm: {
          location: {
            x: 2,
            y: 0,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        lg: {
          location: {
            x: 0,
            y: 0,
          },
          size: {
            width: 2,
            height: 1,
          },
        },
      },
    },
    {
      id: '971aa859-8570-49a1-8d34-dd5c7b3638d1',
      type: 'date',
      properties: {
        display24HourFormat: true,
        dateFormat: 'hide',
        enableTimezone: false,
        timezoneLocation: {
          name: 'Paris',
          latitude: 48.85341,
          longitude: 2.3488,
        },
        titleState: 'city',
      },
      area: {
        type: 'wrapper',
        properties: {
          id: 'default',
        },
      },
      shape: {
        sm: {
          location: {
            x: 1,
            y: 0,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        md: {
          location: {
            x: 4,
            y: 0,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        lg: {
          location: {
            x: 8,
            y: 0,
          },
          size: {
            width: 2,
            height: 1,
          },
        },
      },
    },
    {
      id: 'f252768d-9e69-491b-b6b4-8cad04fa30e8',
      type: 'date',
      properties: {
        display24HourFormat: true,
        dateFormat: 'hide',
        enableTimezone: true,
        timezoneLocation: {
          name: 'Tokyo',
          latitude: 35.6895,
          longitude: 139.69171,
        },
        titleState: 'city',
      },
      area: {
        type: 'wrapper',
        properties: {
          id: 'default',
        },
      },
      shape: {
        sm: {
          location: {
            x: 0,
            y: 0,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        md: {
          location: {
            x: 3,
            y: 0,
          },
          size: {
            width: 1,
            height: 1,
          },
        },
        lg: {
          location: {
            x: 8,
            y: 1,
          },
          size: {
            width: 2,
            height: 1,
          },
        },
      },
    },
  ],
  settings: {
    common: {
      searchEngine: {
        type: 'google',
        properties: {
          enabled: true,
          openInNewTab: true,
        },
      },
    },
    access: {
        allowGuests: false
    },
    customization: {
      accessibility: {
        disablePingPulse: false,
        replacePingDotsWithIcons: false,
      },
      layout: {
        enabledLeftSidebar: false,
        enabledRightSidebar: false,
        enabledDocker: false,
        enabledPing: false,
        enabledSearchbar: true,
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
      gridstack: {
        columnCountSmall: 3,
        columnCountMedium: 6,
        columnCountLarge: 10,
      },
    },
  },
};
