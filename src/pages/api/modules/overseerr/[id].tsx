import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import Consola from 'consola';
import { getConfig } from '../../../../tools/config/getConfig';
import { Config } from '../../../../tools/types';
import { MediaType } from '../../../../modules/overseerr/SearchResult';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  // Get the slug of the request
  const { id, type } = req.query as { id: string; type: string };
  const configName = getCookie('config-name', { req });
  const config = getConfig(configName?.toString() ?? 'default');
  const app = config.apps.find(
    (app) => app.integration?.type === 'overseerr' || app.integration?.type === 'jellyseerr'
  );
  if (!id) {
    return res.status(400).json({ error: 'No id provided' });
  }
  if (!type) {
    return res.status(400).json({ error: 'No type provided' });
  }
  const apiKey = app?.integration?.properties.find((x) => x.field === 'apiKey')?.value;
  if (!apiKey) {
    return res.status(400).json({ error: 'No apps found' });
  }

  const appUrl = new URL(app.url);
  switch (type) {
    case 'movie':
      return axios
        .get(`${appUrl.origin}/api/v1/movie/${id}`, {
          headers: {
            // Set X-Api-Key to the value of the API key
            'X-Api-Key': apiKey,
          },
        })
        .then((axiosres) => res.status(200).json(axiosres.data))

        .catch((err) => {
          Consola.error(err);
          return res.status(500).json({
            message: 'Something went wrong',
          });
        });
    case 'tv':
      // Make request to the tv api
      return axios
        .get(`${appUrl.origin}/api/v1/tv/${id}`, {
          headers: {
            // Set X-Api-Key to the value of the API key
            'X-Api-Key': apiKey,
          },
        })
        .then((axiosres) => res.status(200).json(axiosres.data))
        .catch((err) => {
          Consola.error(err);
          return res.status(500).json({
            message: 'Something went wrong',
          });
        });

    default:
      return res.status(400).json({
        message: 'Wrong request, type should be movie or tv',
      });
  }
}

async function Post(req: NextApiRequest, res: NextApiResponse) {
  // Get the slug of the request
  const { id } = req.query as { id: string };
  const { seasons, type } = req.body as { seasons?: number[]; type: MediaType };
  const configName = getCookie('config-name', { req });
  const config = getConfig(configName?.toString() ?? 'default');
  const app = config.apps.find(
    (app) => app.integration?.type === 'overseerr' || app.integration?.type === 'jellyseerr'
  );
  if (!id) {
    return res.status(400).json({ error: 'No id provided' });
  }
  if (!type) {
    return res.status(400).json({ error: 'No type provided' });
  }

  const apiKey = app?.integration?.properties.find((x) => x.field === 'apiKey')?.value;
  if (!apiKey) {
    return res.status(400).json({ error: 'No app found' });
  }
  if (type === 'movie' && !seasons) {
    return res.status(400).json({ error: 'No seasons provided' });
  }
  const appUrl = new URL(app.url);
  Consola.info('Got an Overseerr request with these arguments', {
    mediaType: type,
    mediaId: id,
    seasons,
  });
  return axios
    .post(
      `${appUrl.origin}/api/v1/request`,
      {
        mediaType: type,
        mediaId: Number(id),
        seasons,
      },
      {
        headers: {
          // Set X-Api-Key to the value of the API key
          'X-Api-Key': apiKey,
        },
      }
    )
    .then((axiosres) => res.status(200).json(axiosres.data))
    .catch((err) =>
      res.status(500).json({
        message: err.message,
      })
    );
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return Post(req, res);
  }
  if (req.method === 'GET') {
    return Get(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
