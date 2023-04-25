import calendar from './calendar/CalendarTile';
import dashdot from './dashDot/DashDotTile';
import date from './date/DateTile';
import torrentNetworkTraffic from './download-speed/TorrentNetworkTrafficTile';
import iframe from './iframe/IFrameTile';
import mediaServer from './media-server/MediaServerTile';
import rss from './rss/RssWidgetTile';
import torrent from './torrent/TorrentTile';
import usenet from './useNet/UseNetTile';
import videoStream from './video/VideoStreamTile';
import weather from './weather/WeatherTile';
import mediaRequestsList from './media-requests/MediaRequestListTile';
import mediaRequestsStats from './media-requests/MediaRequestStatsTile';
import adHoleSummary from './adhole/AdHoleSummary';
import adHoleControls from './adhole/AdHoleControls';

export default {
  calendar,
  dashdot,
  usenet,
  weather,
  'torrents-status': torrent,
  dlspeed: torrentNetworkTraffic,
  date,
  rss,
  'video-stream': videoStream,
  iframe,
  'media-server': mediaServer,
  'media-requests-list': mediaRequestsList,
  'media-requests-stats': mediaRequestsStats,
  'adhole-summary': adHoleSummary,
  'adhole-controls': adHoleControls,
};
