import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  // Extract url from req.query as string
  const { url, base } = req.query;

  // If no url is provided, return an error
  if (!url || !base) {
    return res.status(400).json({
      message: 'Missing required parameter in url',
    });
  }
  // Get the origin URL
  const response = await axios.get(url as string, { baseURL: base as string });
  // Return the response
  return res.status(200).json(response.data);
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
