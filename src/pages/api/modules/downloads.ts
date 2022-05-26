import { QBittorrent } from '@ctrl/qbittorrent';
import { NextApiRequest, NextApiResponse } from 'next';

async function Post(req: NextApiRequest, res: NextApiResponse) {
  // Get the body
  const { body } = req;
  // Get login, password and url from the body
  const { username, password, url } = body;
  const client = new QBittorrent({
    baseUrl: new URL(url).origin,
    username,
    password,
  });
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
