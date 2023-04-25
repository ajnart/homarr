/* eslint-disable no-await-in-loop */
import { z } from 'zod';
import PiHole from 'pihole';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../../tools/config/getConfig';
import { findAppProperty } from '../../../../tools/client/app-properties';

const getQuerySchema = z.object({
  status: z.enum(['enabled', 'disabled']),
});

export const Get = async (request: NextApiRequest, response: NextApiResponse) => {
  const configName = getCookie('config-name', { req: request });
  const config = getConfig(configName?.toString() ?? 'default');

  const parseResult = getQuerySchema.safeParse(request.query);

  if (!parseResult.success) {
    response.status(400).json({ message: 'invalid query parameters, please specify the status' });
    return;
  }

  const applicableApps = config.apps.filter((x) => x.integration?.type === 'pihole');

  for (let i = 0; i < applicableApps.length; i += 1) {
    const app = applicableApps[i];

    const pihole = new PiHole(
      findAppProperty(app, 'password'),
      // not sure why this is needed, but the library seems to prefix automatically
      app.url.replace('http://', '').replace('https://', '')
    );

    switch (parseResult.data.status) {
      case 'enabled':
        await pihole.enable();
        break;
      case 'disabled':
        await pihole.disable();
        break;
    }
  }

  response.status(200).json({});
};

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    return Get(request, response);
  }

  return response.status(405).json({});
};
