import date from './date/DateTile';
import calendar from './calendar/CalendarTile';
import dashdot from './dashDot/DashDotTile';
import usenet from './useNet/UseNetTile';
import weather from './weather/WeatherTile';
import torrent from './torrent/TorrentTile';
import torrentNetworkTraffic from './download-speed/TorrentNetworkTrafficTile';

export default {
  calendar,
  dashdot,
  usenet,
  weather,
  'torrents-status': torrent,
  dlspeed: torrentNetworkTraffic,
  date,
};
