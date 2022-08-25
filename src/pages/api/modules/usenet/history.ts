import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'sabnzbd-api';
import { UsenetHistoryItem } from '../../../../modules';
import { getConfig } from '../../../../tools/getConfig';
import { Config } from '../../../../tools/types';

dayjs.extend(duration);

async function Get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const configName = getCookie('config-name', { req });
    const { config }: { config: Config } = getConfig(configName?.toString() ?? 'default').props;
    const nzbServices = config.services.filter((service) => service.type === 'Sabnzbd');

    const history: UsenetHistoryItem[] = [];

    await Promise.all(
      nzbServices.map(async (service) => {
        if (!service.apiKey) {
          throw new Error(`API Key for service "${service.name}" is missing`);
        }
        const queue = await new Client(service.url, service.apiKey).history();

        queue.slots.forEach((slot) => {
          history.push({
            id: slot.nzo_id,
            name: slot.name,
            size: slot.bytes,
            time: slot.download_time,
          });
        });
      })
    );

    return res.status(200).json(history);
  } catch (err) {
    return res.status(401).json(err);
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
