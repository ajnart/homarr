import PiHole from 'pihole';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../../tools/config/getConfig';
import { AdStatistics, PiholeApiSummaryType } from '../../../../widgets/adhole/type';
import { findAppProperty } from '../../../../tools/client/app-properties';

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

    const pihole = new PiHole(
      findAppProperty(app, 'password'),
      // not sure why this is needed, but the library seems to prefix automatically
      app.url.replace('http://', '').replace('https://', '')
    );

    // eslint-disable-next-line no-await-in-loop
    const summary = (await pihole.summary()) as unknown as PiholeApiSummaryType;

    data.domainsBeingBlocked += Number(summary.domains_being_blocked.replaceAll(',', ''));
    data.adsBlockedToday += Number(summary.ads_blocked_today.replaceAll(',', ''));
    data.dnsQueriesToday = Number(summary.dns_queries_today.replaceAll(',', ''));
    data.status.push({
      status: summary.status,
      appId: app.id,
    });
    adsBlockedTodayPercentageArr.push(summary.ads_percentage_today);
  }

  data.adsBlockedTodayPercentage =
    adsBlockedTodayPercentageArr.reduce((a, b) => a + b, 0) / adsBlockedTodayPercentageArr.length;
  return response.status(200).json(data);
};

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'GET') {
    return Get(request, response);
  }

  return response.status(405);
};
