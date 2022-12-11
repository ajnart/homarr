import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'sabnzbd-api';
import { UsenetQueueItem } from '../../../../components/Dashboard/Tiles/UseNet/types';
import { getConfig } from '../../../../tools/config/getConfig';
import { NzbgetClient } from './nzbget/nzbget-client';
import { NzbgetQueueItem, NzbgetStatus } from './nzbget/types';

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
    const config = getConfig(configName?.toString() ?? 'default');
    const { limit, offset, serviceId } = req.query as any as UsenetQueueRequestParams;

    const service = config.services.find((x) => x.id === serviceId);

    if (!service) {
      throw new Error(`Service with ID "${req.query.serviceId}" could not be found.`);
    }

    let response: UsenetQueueResponse;
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

        const nzbgetQueue: NzbgetQueueItem[] = await new Promise((resolve, reject) => {
          nzbGet.listGroups((err: any, result: NzbgetQueueItem[]) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });

        if (!nzbgetQueue) {
          throw new Error('Error while getting NZBGet queue');
        }

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

        const nzbgetItems: UsenetQueueItem[] = nzbgetQueue.map((item: NzbgetQueueItem) => ({
          id: item.NZBID.toString(),
          name: item.NZBName,
          progress: (item.DownloadedSizeMB / item.FileSizeMB) * 100,
          eta: (item.RemainingSizeMB * 1000000) / nzbgetStatus.DownloadRate,
          // Multiple MB to get bytes
          size: item.FileSizeMB * 1000 * 1000,
          state: getNzbgetState(item.Status),
        }));

        response = {
          items: nzbgetItems,
          total: nzbgetItems.length,
        };
        break;
      }
      case 'sabnzbd': {
        const apiKey = service.integration.properties.find((x) => x.field === 'apiKey')?.value;
        if (!apiKey) {
          throw new Error(`API Key for service "${service.name}" is missing`);
        }

        const { origin } = new URL(service.url);
        const queue = await new Client(origin, apiKey).queue(offset, limit);

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
        throw new Error(`Service type "${service.integration?.type}" unrecognized.`);
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
