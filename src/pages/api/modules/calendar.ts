import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { serviceItem } from '../../../tools/types';

async function Post(req: NextApiRequest, res: NextApiResponse) {
  // Parse req.body as a ServiceItem
  const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString();
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString();
  const TypeToUrl: { service: string; url: string }[] = [
    {
      service: 'sonarr',
      url: '/api/calendar',
    },
    {
      service: 'radarr',
      url: '/api/v3/calendar',
    },
    {
      service: 'lidarr',
      url: '/api/v1/calendar',
    },
    {
      service: 'readarr',
      url: '/api/v1/calendar',
    },
  ];
  const service: serviceItem = req.body;
  const { type } = req.query;
  if (!type) {
    return res.status(400).json({
      message: 'Missing required parameter in url: type',
    });
  }
  if (!service) {
    return res.status(400).json({
      message: 'Missing required parameter in body: service',
    });
  }
  // Match the type to the correct url
  const url = TypeToUrl.find((x) => x.service === type);
  if (!url) {
    return res.status(400).json({
      message: 'Invalid type',
    });
  }
  // Get the origin URL
  let { href: origin } = new URL(service.url);
  if (origin.endsWith('/')) {
    origin = origin.slice(0, -1);
  }
  const pined = `${origin}${url?.url}?apiKey=${service.apiKey}&end=${nextMonth}&start=${lastMonth}`;
  const data = await axios.get(
    `${origin}${url?.url}?apiKey=${service.apiKey}&end=${nextMonth}&start=${lastMonth}`
  );
  return res.status(200).json(data.data);
  // // Make a request to the URL
  // const response = await axios.get(url);
  // // Return the response
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
