import Consola from 'consola';
import { Deluge } from '@ctrl/deluge';
import { QBittorrent } from '@ctrl/qbittorrent';
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { Transmission } from '@ctrl/transmission';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../tools/config/getConfig';

async function Post(req: NextApiRequest, res: NextApiResponse) {
  // Get the type of app from the request url
  const configName = getCookie('config-name', { req });
  const config = getConfig(configName?.toString() ?? 'default');
  const qBittorrentApp = config.apps.filter((app) => app.integration?.type === 'qBittorrent');
  const delugeApp = config.apps.filter((app) => app.integration?.type === 'deluge');
  const transmissionApp = config.apps.filter((app) => app.integration?.type === 'transmission');

  const torrents: NormalizedTorrent[] = [];

  if (!qBittorrentApp && !delugeApp && !transmissionApp) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Missing apps',
    });
  }

  try {
    await Promise.all(
      qBittorrentApp.map((app) =>
        new QBittorrent({
          baseUrl: app.url,
          username:
            app.integration!.properties.find((x) => x.field === 'username')?.value ?? undefined,
          password:
            app.integration!.properties.find((x) => x.field === 'password')?.value ?? undefined,
        })
          .getAllData()
          .then((e) => torrents.push(...e.torrents))
      )
    );
    await Promise.all(
      delugeApp.map((app) => {
        const password =
          app.integration?.properties.find((x) => x.field === 'password')?.value ?? undefined;
        const test = new Deluge({
          baseUrl: app.url,
          password,
        })
          .getAllData()
          .then((e) => torrents.push(...e.torrents));
        return test;
      })
    );
    // Map transmissionApps
    await Promise.all(
      transmissionApp.map((app) =>
        new Transmission({
          baseUrl: app.url,
          username:
            app.integration!.properties.find((x) => x.field === 'username')?.value ?? undefined,
          password:
            app.integration!.properties.find((x) => x.field === 'password')?.value ?? undefined,
        })
          .getAllData()
          .then((e) => torrents.push(...e.torrents))
      )
    );
  } catch (e: any) {
    Consola.error('Error while communicating with your torrent applications:\n', e);
    return res.status(401).json(e);
  }

  Consola.debug(`Retrieved ${torrents.length} from all download clients`);
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
