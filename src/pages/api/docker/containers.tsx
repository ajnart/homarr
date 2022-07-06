import { NextApiRequest, NextApiResponse } from 'next';

import Docker from 'dockerode';

const docker = new Docker();

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const containers = await docker.listContainers({ all: true });
  return res.status(200).json(containers);
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
