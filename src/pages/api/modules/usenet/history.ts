import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'sabnzbd-api';
import { UsenetHistoryItem } from '../../../../modules';
import { getServiceById } from '../../../../tools/hooks/useGetServiceByType';
import { Config } from '../../../../tools/types';
import { NzbgetHistoryItem } from './nzbget/types';
import { NzbgetClient } from './nzbget/nzbget-client';
import { getConfig } from '../../../../tools/config/getConfig';

dayjs.extend(duration);

export interface UsenetHistoryRequestParams {
  serviceId: string;
  offset: number;
  limit: number;
}

export interface UsenetHistoryResponse {
  items: UsenetHistoryItem[];
  total: number;
}

async function Get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const configName = getCookie('config-name', { req });
    const config = getConfig(configName?.toString() ?? 'default');
    const { limit, offset, serviceId } = req.query as any as UsenetHistoryRequestParams;

    const service = config.services.find((x) => x.id === serviceId);

    if (!service) {
      throw new Error(`Service with ID "${req.query.serviceId}" could not be found.`);
    }

    let response: UsenetHistoryResponse;
    switch (service.integration?.type) {
      case 'nzbGet': {
        const url = new URL(service.url);
        const options = {
          host: url.hostname,
          port: url.port,
          login: service.integration.properties.username,
          hash: service.integration.properties.password,
        };

        const nzbGet = NzbgetClient(options);

        const nzbgetHistory: NzbgetHistoryItem[] = await new Promise((resolve, reject) => {
          nzbGet.history(false, (err: any, result: NzbgetHistoryItem[]) => {
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

        const nzbgetItems: UsenetHistoryItem[] = nzbgetHistory.map((item: NzbgetHistoryItem) => ({
          id: item.NZBID.toString(),
          name: item.Name,
          // Convert from MB to bytes
          size: item.DownloadedSizeMB * 1000000,
          time: item.DownloadTimeSec,
        }));

        response = {
          items: nzbgetItems,
          total: nzbgetItems.length,
        };
        break;
      }
      case 'sabnzbd': {
        const { origin } = new URL(service.url);

        if (!service.integration.properties.apiKey) {
          throw new Error(`API Key for service "${service.name}" is missing`);
        }

        const history = await new Client(origin, service.integration.properties.apiKey).history(
          offset,
          limit
        );

        const items: UsenetHistoryItem[] = history.slots.map((slot) => ({
          id: slot.nzo_id,
          name: slot.name,
          size: slot.bytes,
          time: slot.download_time,
        }));

        response = {
          items,
          total: history.noofslots,
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
