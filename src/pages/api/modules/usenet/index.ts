import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'sabnzbd-api';
import { getConfig } from '../../../../tools/getConfig';
import { getServiceById } from '../../../../tools/hooks/useGetServiceByType';
import { Config } from '../../../../tools/types';
import { NzbgetStatus } from './nzbget/types';
import { NzbgetClient } from './nzbget/nzbget-client';

dayjs.extend(duration);

export interface UsenetInfoRequestParams {
  serviceId: string;
}

export interface UsenetInfoResponse {
  paused: boolean;
  sizeLeft: number;
  speed: number;
  eta: number;
}

async function Get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const configName = getCookie('config-name', { req });
    const { config }: { config: Config } = getConfig(configName?.toString() ?? 'default').props;
    const { serviceId } = req.query as any as UsenetInfoRequestParams;

    const service = getServiceById(config, serviceId);

    if (!service) {
      throw new Error(`Service with ID "${req.query.serviceId}" could not be found.`);
    }

    let response: UsenetInfoResponse;
    switch (service.type) {
      case 'NZBGet': {
        const url = new URL(service.url);
        const options = {
          host: url.hostname,
          port: url.port,
          login: service.username,
          hash: service.password,
        };

        const nzbGet = NzbgetClient(options);

        const nzbgetStatus: NzbgetStatus = await new Promise((resolve, reject) => {
          nzbGet.status((err: any, result: NzbgetStatus) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });

        if (!nzbgetStatus) {
          throw new Error('Error while getting NZBGet status');
        }

        const bytesRemaining = nzbgetStatus.RemainingSizeMB * 1000000;
        const eta = bytesRemaining / nzbgetStatus.DownloadRate;
        response = {
          paused: nzbgetStatus.DownloadPaused,
          sizeLeft: bytesRemaining,
          speed: nzbgetStatus.DownloadRate,
          eta,
        };
        break;
      }
      case 'Sabnzbd': {
        if (!service.apiKey) {
          throw new Error(`API Key for service "${service.name}" is missing`);
        }

        const { origin } = new URL(service.url);

        const queue = await new Client(origin, service.apiKey).queue(0, -1);

        const [hours, minutes, seconds] = queue.timeleft.split(':');
        const eta = dayjs.duration({
          hour: parseInt(hours, 10),
          minutes: parseInt(minutes, 10),
          seconds: parseInt(seconds, 10),
        } as any);

        response = {
          paused: queue.paused,
          sizeLeft: parseFloat(queue.mbleft) * 1024 * 1024,
          speed: parseFloat(queue.kbpersec) * 1000,
          eta: eta.asSeconds(),
        };
        break;
      }
      default:
        throw new Error(`Service type "${service.type}" unrecognized.`);
    }

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).send((err as any).message);
  }
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
