import 'i18next';

import authInvite from '../public/locales/en/authentication/invite.json';
import authLogin from '../public/locales/en/authentication/login.json';
import manageBoards from '../public/locales/en/boards/manage.json';
import common from '../public/locales/en/common.json';
import layout from '../public/locales/en/layout/common.json';
import layoutElementSelector from '../public/locales/en/layout/element-selector/selector.json';
import layoutHeader from '../public/locales/en/layout/header.json';
import layoutToggleEditMode from '../public/locales/en/layout/header/actions/toggle-edit-mode.json';
import layoutMobileDrawer from '../public/locales/en/layout/mobile/drawer.json';
import layoutModalAbout from '../public/locales/en/layout/modals/about.json';
import layoutModalAddApp from '../public/locales/en/layout/modals/add-app.json';
import layoutModalChangePosition from '../public/locales/en/layout/modals/change-position.json';
import moduleBookmark from '../public/locales/en/modules/bookmark.json';
import moduleCalendar from '../public/locales/en/modules/calendar.json';
import moduleMediaCards from '../public/locales/en/modules/common-media-cards.json';
import moduleCommon from '../public/locales/en/modules/common.json';
import moduleDashDot from '../public/locales/en/modules/dashdot.json';
import moduleDate from '../public/locales/en/modules/date.json';
import moduleDownload from '../public/locales/en/modules/dlspeed.json';
import moduleDnsHoleControls from '../public/locales/en/modules/dns-hole-controls.json';
import moduleDnsHoleSummary from '../public/locales/en/modules/dns-hole-summary.json';
import moduleDocker from '../public/locales/en/modules/docker.json';
import moduleIframe from '../public/locales/en/modules/iframe.json';
import moduleMediaRequests from '../public/locales/en/modules/media-requests-list.json';
import moduleMediaRequestsStats from '../public/locales/en/modules/media-requests-stats.json';
import moduleMediaServer from '../public/locales/en/modules/media-server.json';
import moduleOverseerr from '../public/locales/en/modules/overseerr.json';
import modulePing from '../public/locales/en/modules/ping.json';
import moduleRss from '../public/locales/en/modules/rss.json';
import moduleSearch from '../public/locales/en/modules/search.json';
import moduleTorrentStatus from '../public/locales/en/modules/torrents-status.json';
import moduleUsenet from '../public/locales/en/modules/usenet.json';
import moduleVideoStream from '../public/locales/en/modules/video-stream.json';
import moduleWeather from '../public/locales/en/modules/weather.json';
import settingsCommon from '../public/locales/en/settings/common.json';
import settingsAppWidth from '../public/locales/en/settings/customization/app-width.json';
import settingsColorSelector from '../public/locales/en/settings/customization/color-selector.json';
import settingsGeneral from '../public/locales/en/settings/customization/general.json';
import settingsGridstack from '../public/locales/en/settings/customization/gridstack.json';
import settingsOpacitySelector from '../public/locales/en/settings/customization/opacity-selector.json';
import settingsPageAppearance from '../public/locales/en/settings/customization/page-appearance.json';
import settingsShadeSelector from '../public/locales/en/settings/customization/shade-selector.json';
import settingsColorSchema from '../public/locales/en/settings/general/color-schema.json';
import settingsConfigChanger from '../public/locales/en/settings/general/config-changer.json';
import settingsInternationalization from '../public/locales/en/settings/general/internationalization.json';
import settingsSearchEngine from '../public/locales/en/settings/general/search-engine.json';
import settingsThemeSelector from '../public/locales/en/settings/general/theme-selector.json';
import settingsWidgetPositions from '../public/locales/en/settings/general/widget-positions.json';
import userPreferences from '../public/locales/en/user/preferences.json';
import widgetsDraggableList from '../public/locales/en/widgets/draggable-list.json';
import widgetsErrorBoundary from '../public/locales/en/widgets/error-boundary.json';
import widgetsLocation from '../public/locales/en/widgets/location.json';
import zod from '../public/locales/en/zod.json';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: 'ns1';
    // custom resources type
    resources: {
      common: typeof common;
      zod: typeof zod;
      'authentication/invite': typeof authInvite;
      'boards/manage': typeof manageBoards;
    };
    // other
  }
}
