import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { getConfig } from '../../../../tools/config/getConfig';
import { IDashDotTile } from '../../../../widgets/dashDot/DashDotTile';

const getQuerySchema = z.object({
  configName: z.string(),
  widgetId: z.string().uuid(),
});

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const parseResult = getQuerySchema.safeParse(req.query);

  if (!parseResult.success) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid query parameters, please specify the widgetId and configName',
    });
  }

  const { configName, widgetId } = parseResult.data;

  const config = getConfig(configName);

  const dashDotWidget = config.widgets.find((x) => x.type === 'dashdot' && x.id === widgetId);

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
  const response = await axios.get(`${url}/info`);
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
