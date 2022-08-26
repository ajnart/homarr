import 'react-i18next';

import common from '../public/locales/en/common.json';
import appShelf from '../public/locales/en/layout/app-shelf.json';
import addServiceAppShelf from '../public/locales/en/layout/add-service-app-shelf.json';
import appShelfMenu from '../public/locales/en/layout/app-shelf-menu.json';
import commonSettings from '../public/locales/en/settings/common.json';
import themeSelector from '../public/locales/en/settings/general/theme-selector.json';
import configChanger from '../public/locales/en/settings/general/config-changer.json';
import i18n from '../public/locales/en/settings/general/internationalization.json';
import moduleEnabler from '../public/locales/en/settings/general/module-enabler.json';
import searchEngine from '../public/locales/en/settings/general/search-engine.json';
import widgetPositions from '../public/locales/en/settings/general/widget-positions.json';
import colorSelector from '../public/locales/en/settings/customization/color-selector.json';
import pageAppearance from '../public/locales/en/settings/customization/page-appearance.json';
import shadeSelector from '../public/locales/en/settings/customization/shade-selector.json';
import appWidth from '../public/locales/en/settings/customization/app-width.json';
import opacitySelector from '../public/locales/en/settings/customization/opacity-selector.json';
import commonModule from '../public/locales/en/modules/common.json';
import dateModule from '../public/locales/en/modules/date.json';
import calendarModule from '../public/locales/en/modules/calendar.json';
import dlSpeedModule from '../public/locales/en/modules/dlspeed.json';
import usenetModule from '../public/locales/en/modules/usenet.json';
import searchModule from '../public/locales/en/modules/search.json';
import torrentsModule from '../public/locales/en/modules/torrents-status.json';
import weatherModule from '../public/locales/en/modules/weather.json';
import pingModule from '../public/locales/en/modules/ping.json';
import dockerModule from '../public/locales/en/modules/docker.json';
import dashDotModule from '../public/locales/en/modules/dashdot.json';
import overseerrModule from '../public/locales/en/modules/overseerr.json';
import mediaCardsModule from '../public/locales/en/modules/common-media-cards.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      'layout/app-shelf': typeof appShelf;
      'layout/add-service-app-shelf': typeof addServiceAppShelf;
      'layout/app-shelf-menu': typeof appShelfMenu;
      'settings/common': typeof commonSettings;
      'settings/general/theme-selector': typeof themeSelector;
      'settings/general/config-changer': typeof configChanger;
      'settings/general/internationalization': typeof i18n;
      'settings/general/module-enabler': typeof moduleEnabler;
      'settings/general/search-engine': typeof searchEngine;
      'settings/general/widget-positions': typeof widgetPositions;
      'settings/customization/color-selector': typeof colorSelector;
      'settings/customization/page-appearance': typeof pageAppearance;
      'settings/customization/shade-selector': typeof shadeSelector;
      'settings/customization/app-width': typeof appWidth;
      'settings/customization/opacity-selector': typeof opacitySelector;
      'modules/common': typeof commonModule;
      'modules/date': typeof dateModule;
      'modules/calendar': typeof calendarModule;
      'modules/dlspeed': typeof dlSpeedModule;
      'modules/usenet': typeof usenetModule;
      'modules/search': typeof searchModule;
      'modules/torrents-status': typeof torrentsModule;
      'modules/weather': typeof weatherModule;
      'modules/ping': typeof pingModule;
      'modules/docker': typeof dockerModule;
      'modules/dashdot': typeof dashDotModule;
      'modules/overseerr': typeof overseerrModule;
      'modules/common-media-cards': typeof mediaCardsModule;
    };
  }
}
