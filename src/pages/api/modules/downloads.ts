import { Deluge } from '@ctrl/deluge';
import { QBittorrent } from '@ctrl/qbittorrent';
import { NextApiRequest, NextApiResponse } from 'next';

async function Post(req: NextApiRequest, res: NextApiResponse) {
  // Get the type of service from the request url
  const { dlclient } = req.query;
  const { body } = req;
  // Get login, password and url from the body
  const { username, password, url } = body;
  if (!dlclient || (!username && !password) || !url) {
    return res.status(400).json({
      error: 'Wrong request',
    });
  }
  let client: Deluge | QBittorrent;
  switch (dlclient) {
    case 'qbit':
      client = new QBittorrent({
        baseUrl: new URL(url).origin,
        username,
        password,
      });
      break;
    case 'deluge':
      client = new Deluge({
        baseUrl: new URL(url).origin,
        password,
      });
      break;
    default:
      return res.status(400).json({
        error: 'Wrong request',
      });
  }
  const data = await client.getAllData();
  res.status(200).json({
    torrents: data.torrents,
  });
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
