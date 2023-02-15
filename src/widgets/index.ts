import calendar from './calendar/CalendarTile';
import dashdot from './dashDot/DashDotTile';
import date from './date/DateTile';
import torrentNetworkTraffic from './download-speed/TorrentNetworkTrafficTile';
import mediaServer from './media-server/MediaServerTile';
import rss from './rss/RssWidgetTile';
import torrent from './torrent/TorrentTile';
import usenet from './useNet/UseNetTile';
import videoStream from './video/VideoStreamTile';
import weather from './weather/WeatherTile';

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
  'media-server': mediaServer,
};
