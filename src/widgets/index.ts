import date from './date/DateTile';
import calendar from './calendar/CalendarTile';
import dashdot from './dashDot/DashDotTile';
import usenet from './useNet/UseNetTile';
import weather from './weather/WeatherTile';
import bitTorrent from './bitTorrent/BitTorrentTile';
import torrentNetworkTraffic from './torrentNetworkTraffic/TorrentNetworkTrafficTile';

export default {
  calendar,
  dashdot,
  usenet,
  weather,
  'torrents-status': bitTorrent,
  dlspeed: torrentNetworkTraffic,
  date,
};
