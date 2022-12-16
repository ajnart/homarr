import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../tools/config/getConfig';
import { ServiceIntegrationType } from '../../../types/service';

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
  // Parse req.body as a ServiceItem
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

  const mediaServiceIntegrationTypes: ServiceIntegrationType['type'][] = [
    'sonarr',
    'radarr',
    'readarr',
    'lidarr',
  ];
  const mediaServices = config.services.filter(
    (service) =>
      service.integration && mediaServiceIntegrationTypes.includes(service.integration.type)
  );

  const medias = await Promise.all(
    await mediaServices.map(async (service) => {
      const integration = service.integration!;
      const endpoint = IntegrationTypeEndpointMap.get(integration.type);
      if (!endpoint) {
        return {
          type: integration.type,
          items: [],
        };
      }

      // Get the origin URL
      let { href: origin } = new URL(service.url);
      if (origin.endsWith('/')) {
        origin = origin.slice(0, -1);
      }

      const start = new Date(year, month - 1, 1); // First day of month
      const end = new Date(year, month, 0); // Last day of month

      const apiKey = integration.properties.find((x) => x.field === 'apiKey')?.value;
      if (!apiKey) return { type: integration.type, items: [] };
      return axios
        .get(
          `${origin}${endpoint}?apiKey=${apiKey}&end=${end.toISOString()}&start=${start.toISOString()}`
        )
        .then((x) => ({ type: integration.type, items: x.data as any[] }));
    })
  );

  // FIXME: I need an integration for each of them
  return res.status(200).json({
    tvShows: medias.filter((m) => m.type === 'sonarr').flatMap((m) => m.items),
    movies: medias.filter((m) => m.type === 'radarr').flatMap((m) => m.items),
    books: medias.filter((m) => m.type === 'readarr').flatMap((m) => m.items),
    musics: medias.filter((m) => m.type === 'lidarr').flatMap((m) => m.items),
    totalCount: medias.reduce((p, c) => p + c.items.length, 0),
  });
}

const IntegrationTypeEndpointMap = new Map<ServiceIntegrationType['type'], string>([
  ['sonarr', '/api/calendar'],
  ['radarr', '/api/v3/calendar'],
  ['lidarr', '/api/v1/calendar'],
  ['readarr', '/api/v1/calendar'],
]);
