import axios from 'axios';
import Consola from 'consola';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../tools/config/getConfig';
import { AppIntegrationType } from '../../../types/app';

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

async function Get(req: NextApiRequest, res: NextApiResponse) {
  // Parse req.body as a AppItem
  const {
    month: monthString,
    year: yearString,
    configName,
  } = req.query as { month: string; year: string; configName: string };

  const month = parseInt(monthString, 10);
  const year = parseInt(yearString, 10);

  if (Number.isNaN(month) || Number.isNaN(year) || !configName) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Missing required parameter in url: year, month or configName',
    });
  }

  const config = getConfig(configName);

  // Find the calendar widget in the config
  const calendar = config.widgets.find((w) => w.id === 'calendar');
  const useSonarrv4 = calendar?.properties.useSonarrv4 ?? false;

  const mediaAppIntegrationTypes: AppIntegrationType['type'][] = [
    'sonarr',
    'radarr',
    'readarr',
    'lidarr',
  ];
  const mediaApps = config.apps.filter(
    (app) => app.integration && mediaAppIntegrationTypes.includes(app.integration.type)
  );

  const IntegrationTypeEndpointMap = new Map<AppIntegrationType['type'], string>([
     ['sonarr', useSonarrv4 ? '/api/v3/calendar' : '/api/calendar'],
    ['radarr', '/api/v3/calendar'],
    ['lidarr', '/api/v1/calendar'],
    ['readarr', '/api/v1/calendar'],
  ]);

  try {
    const medias = await Promise.all(
      await mediaApps.map(async (app) => {
        const integration = app.integration!;
        const endpoint = IntegrationTypeEndpointMap.get(integration.type);
        if (!endpoint) {
          return {
            type: integration.type,
            items: [],
            success: false,
          };
        }

        // Get the origin URL
        let { href: origin } = new URL(app.url);
        if (origin.endsWith('/')) {
          origin = origin.slice(0, -1);
        }

        const start = new Date(year, month - 1, 1); // First day of month
        const end = new Date(year, month, 0); // Last day of month

        const apiKey = integration.properties.find((x) => x.field === 'apiKey')?.value;
        if (!apiKey) return { type: integration.type, items: [], success: false };
        return axios
          .get(
            `${origin}${endpoint}?apiKey=${apiKey}&end=${end.toISOString()}&start=${start.toISOString()}&includeSeries=true&includeEpisodeFile=true&includeEpisodeImages=true`
          )
          .then((x) => ({ type: integration.type, items: x.data as any[], success: true }))
          .catch((err) => {
            Consola.error(
              `failed to process request to app '${integration.type}' (${app.id}): ${err}`
            );
            return {
              type: integration.type,
              items: [],
              success: false,
            };
          });
      })
    );

    const countFailed = medias.filter((x) => !x.success).length;
    if (countFailed > 0) {
      Consola.warn(`A total of ${countFailed} apps for the calendar widget failed`);
    }

    return res.status(200).json({
      tvShows: medias.filter((m) => m.type === 'sonarr').flatMap((m) => m.items),
      movies: medias.filter((m) => m.type === 'radarr').flatMap((m) => m.items),
      books: medias.filter((m) => m.type === 'readarr').flatMap((m) => m.items),
      musics: medias.filter((m) => m.type === 'lidarr').flatMap((m) => m.items),
      totalCount: medias.reduce((p, c) => p + c.items.length, 0),
    });
  } catch (error) {
    Consola.error(`Error while requesting media from your app. Check your configuration. ${error}`);

    return res.status(500).json({
      tvShows: [],
      movies: [],
      books: [],
      musics: [],
      totalCount: 0,
    });
  }
}
