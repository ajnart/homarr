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
import docker from './docker/DockerTile';

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
  docker,
};
