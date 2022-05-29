import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { serviceItem } from '../../../tools/types';

async function Post(req: NextApiRequest, res: NextApiResponse) {
  const { service }: { service: serviceItem } = req.body;
  const { query } = req.query;
  // If query is an empty string, return an empty array
  if (query === '') {
    return res.status(200).json([]);
  }
  if (!service || !query || !service.apiKey) {
    return res.status(400).json({
      error: 'Wrong request',
    });
  }
  const serviceUrl = new URL(service.url);
  const data = await axios
    .get(`${serviceUrl.origin}/api/v1/search?query=${query}`, {
      headers: {
        // Set X-Api-Key to the value of the API key
        'X-Api-Key': service.apiKey,
      },
    })
    .then((res) => res.data);
  // Get login, password and url from the body
  res.status(200).json(
    data,
  );
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
