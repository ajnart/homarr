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
  const qBittorrentService = config.services
    .filter((service) => service.type === 'qBittorrent')
    .at(0);
  const delugeService = config.services.filter((service) => service.type === 'Deluge').at(0);
  const transmissionService = config.services
    .filter((service) => service.type === 'Transmission')
    .at(0);
  if (!qBittorrentService && !delugeService && !transmissionService) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Missing service',
    });
  }
  if (qBittorrentService) {
    torrents.push(
      ...(
        await new QBittorrent({
          baseUrl: qBittorrentService.url,
          username: qBittorrentService.username,
          password: qBittorrentService.password,
        }).getAllData()
      ).torrents
    );
  }
  if (delugeService) {
    const delugeTorrents = (
      await new Deluge({
        baseUrl: delugeService.url,
        username: delugeService.username,
        password: delugeService.password,
      }).getAllData()
    ).torrents;
    delugeTorrents.forEach((delugeTorrent) =>
      torrents.push({ ...delugeTorrent, progress: delugeTorrent.progress / 100 })
    );
  }
  if (transmissionService) {
    torrents.push(
      ...(
        await new Transmission({
          baseUrl: transmissionService.url,
          username: transmissionService.username,
          password: transmissionService.password,
        }).getAllData()
      ).torrents
    );
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
