import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;
  const response = await axios.get(`https://duckduckgo.com/ac/?q=${q}`);
  res.status(200).json(response.data);
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
