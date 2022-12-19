import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'sabnzbd-api';
import { NzbgetHistoryItem } from './nzbget/types';
import { NzbgetClient } from './nzbget/nzbget-client';
import { getConfig } from '../../../../tools/config/getConfig';
import { UsenetHistoryItem } from '../../../../widgets/useNet/types';

dayjs.extend(duration);

export interface UsenetHistoryRequestParams {
  appId: string;
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
    const { limit, offset, appId } = req.query as any as UsenetHistoryRequestParams;

    const app = config.apps.find((x) => x.id === appId);

    if (!app) {
      throw new Error(`App with ID "${req.query.appId}" could not be found.`);
    }

    let response: UsenetHistoryResponse;
    switch (app.integration?.type) {
      case 'nzbGet': {
        const url = new URL(app.url);
        const options = {
          host: url.hostname,
          port: url.port,
          login: app.integration.properties.find((x) => x.field === 'username')?.value ?? undefined,
          hash: app.integration.properties.find((x) => x.field === 'password')?.value ?? undefined,
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
        const { origin } = new URL(app.url);

        const apiKey = app.integration.properties.find((x) => x.field === 'apiKey')?.value;
        if (!apiKey) {
          throw new Error(`API Key for app "${app.name}" is missing`);
        }

        const history = await new Client(origin, apiKey).history(offset, limit);

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
        throw new Error(`App type "${app.integration?.type}" unrecognized.`);
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
