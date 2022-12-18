import axios from 'axios';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../../tools/getConfig';
import { Config } from '../../../../tools/types';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const configName = getCookie('config-name', { req });
  const { config }: { config: Config } = getConfig(configName?.toString() ?? 'default').props;
  const { query } = req.query;
  const app = config.apps.find(
    (app) => app.type === 'Overseerr' || app.type === 'Jellyseerr'
  );
  // If query is an empty string, return an empty array
  if (query === '' || query === undefined) {
    return res.status(200).json([]);
  }
  if (!app || !query || app === undefined || !app.apiKey) {
    return res.status(400).json({
      error: 'Wrong request',
    });
  }
  const appUrl = new URL(app.url);
  const data = await axios
    .get(`${appUrl.origin}/api/v1/search?query=${query}`, {
      headers: {
        // Set X-Api-Key to the value of the API key
        'X-Api-Key': app.apiKey,
      },
    })
    .then((res) => res.data);
  // Get login, password and url from the body
  res.status(200).json(data);
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
