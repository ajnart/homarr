import axios from 'axios';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../../tools/config/getConfig';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const configName = getCookie('config-name', { req });
  const config = getConfig(configName?.toString() ?? 'default');
  const { query } = req.query;
  const app = config.apps.find(
    (app) => app.integration?.type === 'overseerr' || app.integration?.type === 'jellyseerr'
  );
  // If query is an empty string, return an empty array
  if (query === '' || query === undefined) {
    return res.status(200).json([]);
  }

  const apiKey = app?.integration?.properties.find((x) => x.field === 'apiKey')?.value;
  if (!app || !query || !apiKey) {
    return res.status(400).json({
      error: 'Wrong request',
    });
  }
  const appUrl = new URL(app.url);
  const data = await axios
    .get(`${appUrl.origin}/api/v1/search?query=${query}`, {
      headers: {
        // Set X-Api-Key to the value of the API key
        'X-Api-Key': apiKey,
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
