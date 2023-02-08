import { NextApiRequest, NextApiResponse } from 'next';
import { getDashboards } from '../../../tools/getDashboards';

function Get(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json(getDashboards());
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
