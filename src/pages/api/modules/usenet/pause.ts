import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'sabnzbd-api';
import { getConfig } from '../../../../tools/config/getConfig';
import { NzbgetClient } from './nzbget/nzbget-client';

dayjs.extend(duration);

export interface UsenetPauseRequestParams {
  serviceId: string;
}

async function Post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const configName = getCookie('config-name', { req });
    const config = getConfig(configName?.toString() ?? 'default');
    const { serviceId } = req.query as any as UsenetPauseRequestParams;

    const service = config.services.find((x) => x.id === serviceId);

    if (!service) {
      throw new Error(`Service with ID "${req.query.serviceId}" could not be found.`);
    }

    let result;
    switch (service.integration?.type) {
      case 'nzbGet': {
        const url = new URL(service.url);
        const options = {
          host: url.hostname,
          port: url.port,
          login:
            service.integration.properties.find((x) => x.field === 'username')?.value ?? undefined,
          hash:
            service.integration.properties.find((x) => x.field === 'password')?.value ?? undefined,
        };

        const nzbGet = NzbgetClient(options);

        result = await new Promise((resolve, reject) => {
          nzbGet.pauseDownload(false, (err: any, result: any) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });
        break;
      }
      case 'sabnzbd': {
        const apiKey = service.integration.properties.find((x) => x.field === 'apiKey')?.value;
        if (!apiKey) {
          throw new Error(`API Key for service "${service.name}" is missing`);
        }

        const { origin } = new URL(service.url);

        result = await new Client(origin, apiKey).queuePause();
        break;
      }
      default:
        throw new Error(`Service type "${service.integration?.type}" unrecognized.`);
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).send((err as any).message);
  }
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
