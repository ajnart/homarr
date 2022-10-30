import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { NextApiRequest, NextApiResponse } from 'next';
import NZBGet from 'nzbget-api';
import { Client } from 'sabnzbd-api';
import { getConfig } from '../../../../tools/getConfig';
import { getServiceById } from '../../../../tools/hooks/useGetServiceByType';
import { Config } from '../../../../tools/types';

dayjs.extend(duration);

export interface UsenetResumeRequestParams {
  serviceId: string;
  nzbId?: string;
}

async function Post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const configName = getCookie('config-name', { req });
    const { config }: { config: Config } = getConfig(configName?.toString() ?? 'default').props;
    const { serviceId } = req.query as any as UsenetResumeRequestParams;

    const service = getServiceById(config, serviceId);

    if (!service) {
      throw new Error(`Service with ID "${req.query.serviceId}" could not be found.`);
    }

    let result;
    switch (service.type) {
      case 'NZBGet': {
        const url = new URL(service.url);
        const options = {
          host: url.hostname,
          port: url.port,
          login: service.username,
          hash: service.password,
        };

        const nzbGet = new NZBGet(options);

        result = await new Promise((resolve, reject) => {
          nzbGet.resumeDownload(false, (err: any, result: any) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });
        break;
      }
      case 'Sabnzbd': {
        if (!service.apiKey) {
          throw new Error(`API Key for service "${service.name}" is missing`);
        }
    
        const { origin } = new URL(service.url);
    
        result = await new Client(origin, service.apiKey).queueResume();
        break;
      }
      default:
        throw new Error(`Service type "${service.type}" unrecognized.`);
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
