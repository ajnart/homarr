import { Deluge } from '@ctrl/deluge';
import { QBittorrent } from '@ctrl/qbittorrent';
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { Transmission } from '@ctrl/transmission';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../tools/getConfig';
import { Config } from '../../../tools/types';

async function Post(req: NextApiRequest, res: NextApiResponse) {
  // Get the type of service from the request url
  const configName = getCookie('config-name', { req });
  const { config }: { config: Config } = getConfig(configName?.toString() ?? 'default').props;
  const qBittorrentServices = config.services.filter((service) => service.type === 'qBittorrent');
  const delugeServices = config.services.filter((service) => service.type === 'Deluge');
  const transmissionServices = config.services.filter((service) => service.type === 'Transmission');

  const torrents: NormalizedTorrent[] = [];

  if (!qBittorrentServices && !delugeServices && !transmissionServices) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Missing services',
    });
  }
  try {
    await Promise.all(
      qBittorrentServices.map((service) =>
        new QBittorrent({
          baseUrl: service.url,
          username: service.username,
          password: service.password,
        })
          .getAllData()
          .then((e) => torrents.push(...e.torrents))
      )
    );
    await Promise.all(
      delugeServices.map((service) =>
        new Deluge({
          baseUrl: service.url,
          password: 'password' in service ? service.password : '',
        })
          .getAllData()
          .then((e) => torrents.push(...e.torrents))
      )
    );
    // Map transmissionServices
    await Promise.all(
      transmissionServices.map((service) =>
        new Transmission({
          baseUrl: service.url,
          username: 'username' in service ? service.username : '',
          password: 'password' in service ? service.password : '',
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
