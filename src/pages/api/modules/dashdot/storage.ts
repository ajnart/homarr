import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../../tools/config/getConfig';
import { IDashDotTile } from '../../../../widgets/dashDot/DashDotTile';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const { configName } = req.query;

  if (!configName || typeof configName !== 'string') {
    return res.status(400).json({
      message: 'Missing required configName in url',
    });
  }

  const config = getConfig(configName);
  const dashDotWidget = config.widgets.find((x) => x.id === 'dashdot');

  if (!dashDotWidget) {
    return res.status(400).json({
      message: 'There is no dashdot widget defined',
    });
  }

  const dashDotUrl = (dashDotWidget as IDashDotTile).properties.url;

  if (!dashDotUrl) {
    return res.status(400).json({
      message: 'Dashdot url must be defined in config',
    });
  }

  // Get the origin URL
  const url = dashDotUrl.endsWith('/')
    ? dashDotUrl.substring(0, dashDotUrl.length - 1)
    : dashDotUrl;
  const response = await axios.get(`${url}/load/storage`);
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
