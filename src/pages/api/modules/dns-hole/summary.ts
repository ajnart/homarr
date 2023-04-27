import Consola from 'consola';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { findAppProperty } from '../../../../tools/client/app-properties';
import { getConfig } from '../../../../tools/config/getConfig';
import { PiHoleClient } from '../../../../tools/server/sdk/pihole/piHole';
import { AdStatistics } from '../../../../widgets/dnshole/type';

export const Get = async (request: NextApiRequest, response: NextApiResponse) => {
  const configName = getCookie('config-name', { req: request });
  const config = getConfig(configName?.toString() ?? 'default');

  const applicableApps = config.apps.filter((x) => x.integration?.type === 'pihole');

  const data: AdStatistics = {
    domainsBeingBlocked: 0,
    adsBlockedToday: 0,
    adsBlockedTodayPercentage: 0,
    dnsQueriesToday: 0,
    status: [],
  };

  const adsBlockedTodayPercentageArr: number[] = [];

  for (let i = 0; i < applicableApps.length; i += 1) {
    const app = applicableApps[i];

    try {
      const piHole = new PiHoleClient(app.url, findAppProperty(app, 'password'));

      // eslint-disable-next-line no-await-in-loop
      const summary = await piHole.getSummary();

      data.domainsBeingBlocked += summary.domains_being_blocked;
      data.adsBlockedToday += summary.ads_blocked_today;
      data.dnsQueriesToday += summary.dns_queries_today;
      data.status.push({
        status: summary.status,
        appId: app.id,
      });
      adsBlockedTodayPercentageArr.push(summary.ads_percentage_today);
    } catch (err) {
      Consola.error(`Failed to communicate with PiHole at ${app.url}: ${err}`);
    }
  }

  data.adsBlockedTodayPercentage = data.adsBlockedToday / data.dnsQueriesToday;
  if (Number.isNaN(data.adsBlockedTodayPercentage)) {
    data.adsBlockedTodayPercentage = 0;
  }
  return response.status(200).json(data);
};

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'GET') {
    return Get(request, response);
  }

  return response.status(405);
};
