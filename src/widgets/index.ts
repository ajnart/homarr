import bookmark from './bookmark/BookmarkWidgetTile';
import calendar from './calendar/CalendarTile';
import dashdot from './dashDot/DashDotTile';
import date from './date/DateTile';
import dnsHoleControls from './dnshole/DnsHoleControls';
import dnsHoleSummary from './dnshole/DnsHoleSummary';
import torrentNetworkTraffic from './download-speed/TorrentNetworkTrafficTile';
import iframe from './iframe/IFrameTile';
import mediaRequestsList from './media-requests/MediaRequestListTile';
import mediaRequestsStats from './media-requests/MediaRequestStatsTile';
import mediaServer from './media-server/MediaServerTile';
import rss from './rss/RssWidgetTile';
import torrent from './torrent/TorrentTile';
import usenet from './useNet/UseNetTile';
import videoStream from './video/VideoStreamTile';
import weather from './weather/WeatherTile';
import notebook from './notebook/NotebookWidgetTile';

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
  'dns-hole-summary': dnsHoleSummary,
  'dns-hole-controls': dnsHoleControls,
  bookmark,
  notebook,
};
