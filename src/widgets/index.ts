import calendar from './calendar/CalendarTile';
import dashdot from './dashDot/DashDotTile';
import date from './date/DateTile';
import torrentNetworkTraffic from './download-speed/TorrentNetworkTrafficTile';
import rss from './rss/RssWidgetTile';
import torrent from './torrent/TorrentTile';
import usenet from './useNet/UseNetTile';
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
};
