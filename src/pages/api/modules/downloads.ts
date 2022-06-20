import { Deluge } from '@ctrl/deluge';
import { QBittorrent } from '@ctrl/qbittorrent';
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { Transmission } from '@ctrl/transmission';
import { NextApiRequest, NextApiResponse } from 'next';
import { Config } from '../../../tools/types';

async function Post(req: NextApiRequest, res: NextApiResponse) {
  // Get the type of service from the request url
  const torrents: NormalizedTorrent[] = [];
  const { config }: { config: Config } = req.body;
  const qBittorrentServices = config.services
    .filter((service) => service.type === 'qBittorrent');

  const delugeServices = config.services.filter((service) => service.type === 'Deluge');
  const transmissionServices = config.services
    .filter((service) => service.type === 'Transmission');

  if (!qBittorrentServices && !delugeServices && !transmissionServices) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Missing services',
    });
  }
  if (qBittorrentServices) {
    for (const service of qBittorrentServices) {
      torrents.push(
        ...(
          await new QBittorrent({
            baseUrl: service.url,
            username: service.username,
            password: service.password,
          }).getAllData()
        ).torrents
      );
    }
  }
  if (delugeServices) {
      for (const service of delugeServices) {
        torrents.push(
          ...(
            await new Deluge({
              baseUrl: service.url,
              password: 'password' in service ? service.password : '',
            }).getAllData()
          ).torrents
        )
      }
  }
  if (transmissionServices) {
    for (const service of transmissionServices) {
      torrents.push(
        ...(
          await new Transmission({
            baseUrl: service.url,
            username: 'username' in service ? service.username : '',
            password: 'password' in service ? service.password : '',
          }).getAllData()
        ).torrents
      );
    }
  }
  res.status(200).json(torrents);
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
