import { NextApiRequest, NextApiResponse } from 'next';

import Docker from 'dockerode';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const docker = new Docker();
    const containers = await docker.listContainers();
    res.status(200).json(containers);
  } catch (err) {
    res.status(500).json({ err });
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the reuqest is a POST or a GET
  if (req.method === 'GET') {
    return Get(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
