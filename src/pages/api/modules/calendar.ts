import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../tools/config/getConfig';
import { ServiceIntegrationType, ServiceType } from '../../../types/service';

/*async function Post(req: NextApiRequest, res: NextApiResponse) {
  // Parse req.body as a ServiceItem
  const { id } = req.body;
  const { type } = req.query;
  const configName = getCookie('config-name', { req });
  const { config }: { config: Config } = getConfig(configName?.toString() ?? 'default').props;
  // Find service with serviceId in config
  const service = config.services.find((service) => service.id === id);
  if (!service) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Missing service',
    });
  }

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
  return axios
    .get(`${origin}${url?.url}?apiKey=${service.apiKey}&end=${nextMonth}&start=${lastMonth}`)
    .then((response) => res.status(200).json(response.data))
    .catch((e) => res.status(500).json(e));
  // // Make a request to the URL
  // const response = await axios.get(url);
  // // Return the response
}*/

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

  const month = parseInt(monthString);
  const year = parseInt(yearString);

  if (isNaN(month) || isNaN(year) || !configName) {
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
      if (!endpoint)
        return {
          type: integration.type,
          items: [],
        };

      // Get the origin URL
      let { href: origin } = new URL(service.url);
      if (origin.endsWith('/')) {
        origin = origin.slice(0, -1);
      }

      const start = new Date(year, month - 1, 1); // First day of month
      const end = new Date(year, month, 0); // Last day of month

      const apiKey = integration.properties.find((x) => x.field === 'apiKey')?.value;
      if (!apiKey) return { type: integration.type, items: [] };
      return await axios
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
