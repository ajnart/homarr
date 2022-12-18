import { Deluge } from '@ctrl/deluge';
import { QBittorrent } from '@ctrl/qbittorrent';
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { Transmission } from '@ctrl/transmission';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../tools/getConfig';
import { Config } from '../../../tools/types';

async function Post(req: NextApiRequest, res: NextApiResponse) {
  // Get the type of app from the request url
  const configName = getCookie('config-name', { req });
  const { config }: { config: Config } = getConfig(configName?.toString() ?? 'default').props;
  const qBittorrentApp = config.apps.filter((app) => app.type === 'qBittorrent');
  const delugeApp = config.apps.filter((app) => app.type === 'Deluge');
  const transmissionApp = config.apps.filter((app) => app.type === 'Transmission');

  const torrents: NormalizedTorrent[] = [];

  if (!qBittorrentApp && !delugeApp && !transmissionApp) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Missing apps',
    });
  }
  try {
    await Promise.all(
      qBittorrentApp.map((apps) =>
        new QBittorrent({
          baseUrl: apps.url,
          username: apps.username,
          password: apps.password,
        })
          .getAllData()
          .then((e) => torrents.push(...e.torrents))
      )
    );
    await Promise.all(
      delugeApp.map((apps) =>
        new Deluge({
          baseUrl: apps.url,
          password: 'password' in apps ? apps.password : '',
        })
          .getAllData()
          .then((e) => torrents.push(...e.torrents))
      )
    );
    // Map transmissionApps
    await Promise.all(
      transmissionApp.map((apps) =>
        new Transmission({
          baseUrl: apps.url,
          username: 'username' in apps ? apps.username : '',
          password: 'password' in apps ? apps.password : '',
        })
          .getAllData()
          .then((e) => torrents.push(...e.torrents))
      )
    );
  } catch (e: any) {
    return res.status(401).json(e);
  }
  return res.status(200).json(torrents);
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the reuqest is a POST or a GET
  if (req.method === 'POST') {
    return Post(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
