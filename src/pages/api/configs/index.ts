import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

function Get(req: NextApiRequest, res: NextApiResponse) {
  // Get all the configs in the /data/configs folder
  // All the files that end in ".json"
  const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));
  // Strip the .json extension from the file name
  const configs = files.map((file) => file.replace('.json', ''));

  return res.status(200).json(configs);
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
