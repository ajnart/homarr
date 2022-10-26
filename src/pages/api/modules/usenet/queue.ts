import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'sabnzbd-api';
import NZBGet from 'nzbget-api';
import { UsenetQueueItem } from '../../../../modules';
import { getConfig } from '../../../../tools/getConfig';
import { getServiceById } from '../../../../tools/hooks/useGetServiceByType';
import { Config } from '../../../../tools/types';

dayjs.extend(duration);

export interface UsenetQueueRequestParams {
  serviceId: string;
  offset: number;
  limit: number;
}

export interface UsenetQueueResponse {
  items: UsenetQueueItem[];
  total: number;
}

async function Get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const configName = getCookie('config-name', { req });
    const { config }: { config: Config } = getConfig(configName?.toString() ?? 'default').props;
    const { limit, offset, serviceId } = req.query as any as UsenetQueueRequestParams;

    const service = getServiceById(config, serviceId);

    if (!service) {
      throw new Error(`Service with ID "${req.query.serviceId}" could not be found.`);
    }

    let response: UsenetQueueResponse;
    switch (service.type) {
      case 'NZBGet': {
        // TODO: Create common function that sets up the NZBGET client
        const url = new URL(service.url);
        const options = {
          host: url.hostname,
          port: url.port,
          login: service.username,
          hash: service.password,
        };

        const nzbGet = new NZBGet(options);

        const nzbgetHistory:[] = await new Promise((resolve, reject) => {
          nzbGet.listGroups((err: any, result: any) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });

        if (!nzbgetHistory) {
          throw new Error('Error while getting NZBGet history');
        }

        const nzbgetItems: UsenetQueueItem[] = nzbgetHistory.map((item: any) => ({
          id: item.NZBID,
          name: item.NZBName,
          progress: 50,
          eta: 3,
          // Multiple MB to get bytes
          size: item.RemainingSizeMB * 1000000,
          state: getNzbgetState(item.Status),
        }));

        response = {
          items: nzbgetItems,
          total: nzbgetItems.length,
        };
        break;
      }
      case 'Sabnzbd': {
        if (!service.apiKey) {
          throw new Error(`API Key for service "${service.name}" is missing`);
        }

        const { origin } = new URL(service.url);
        const queue = await new Client(origin, service.apiKey).queue(offset, limit);

        const items: UsenetQueueItem[] = queue.slots.map((slot) => {
          const [hours, minutes, seconds] = slot.timeleft.split(':');
          const eta = dayjs.duration({
            hour: parseInt(hours, 10),
            minutes: parseInt(minutes, 10),
            seconds: parseInt(seconds, 10),
          } as any);

          return {
            id: slot.nzo_id,
            eta: eta.asSeconds(),
            name: slot.filename,
            progress: parseFloat(slot.percentage),
            size: parseFloat(slot.mb) * 1000 * 1000,
            state: slot.status.toLowerCase() as any,
          };
        });

        response = {
          items,
          total: queue.noofslots,
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

function getNzbgetState(status: string) {
  switch (status) {
    case 'QUEUED':
      return 'queued';
    case 'PAUSED ':
        return 'paused';
    default:
      return 'downloading';
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
