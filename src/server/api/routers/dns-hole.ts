import { z } from 'zod';
import { findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { AdGuard } from '~/tools/server/sdk/adGuard/adGuard';
import { PiHoleClient } from '~/tools/server/sdk/pihole/piHole';
import { ConfigAppType } from '~/types/app';
import { AdStatistics } from '~/widgets/dnshole/type';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const dnsHoleRouter = createTRPCRouter({
  control: publicProcedure
    .input(
      z.object({
        status: z.enum(['enabled', 'disabled']),
        configName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const config = getConfig(input.configName);

      const applicableApps = config.apps.filter(
        (x) => x.integration?.type && ['pihole', 'adGuardHome'].includes(x.integration?.type)
      );

      await Promise.all(
        applicableApps.map(async (app) => {
          if (app.integration?.type === 'pihole') {
            await processPiHole(app, input.status === 'disabled');
            return;
          }

          await processAdGuard(app, input.status === 'disabled');
        })
      );
    }),
  summary: publicProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const applicableApps = config.apps.filter(
        (x) => x.integration?.type && ['pihole', 'adGuardHome'].includes(x.integration?.type)
      );

      const result = await Promise.all(
        applicableApps.map(async (app) =>
          app.integration?.type === 'pihole'
            ? collectPiHoleSummary(app)
            : collectAdGuardSummary(app)
        )
      );

      const data = result.reduce(
        (prev: AdStatistics, curr) => ({
          domainsBeingBlocked: prev.domainsBeingBlocked + curr.domainsBeingBlocked,
          adsBlockedToday: prev.adsBlockedToday + curr.adsBlockedToday,
          dnsQueriesToday: prev.dnsQueriesToday + curr.dnsQueriesToday,
          status: [...prev.status, curr.status],
          adsBlockedTodayPercentage: 0,
        }),
        {
          domainsBeingBlocked: 0,
          adsBlockedToday: 0,
          adsBlockedTodayPercentage: 0,
          dnsQueriesToday: 0,
          status: [],
        }
      );

      //const data: AdStatistics = ;

      data.adsBlockedTodayPercentage = data.adsBlockedToday / data.dnsQueriesToday;
      if (Number.isNaN(data.adsBlockedTodayPercentage)) {
        data.adsBlockedTodayPercentage = 0;
      }
      return data;
    }),
});

const processAdGuard = async (app: ConfigAppType, enable: boolean) => {
  const adGuard = new AdGuard(
    app.url,
    findAppProperty(app, 'username'),
    findAppProperty(app, 'password')
  );

  if (enable) {
    await adGuard.disable();
    return;
  }

  await adGuard.enable();
};

const processPiHole = async (app: ConfigAppType, enable: boolean) => {
  const pihole = new PiHoleClient(app.url, findAppProperty(app, 'apiKey'));

  if (enable) {
    await pihole.enable();
    return;
  }

  await pihole.disable();
};

const collectPiHoleSummary = async (app: ConfigAppType) => {
  const piHole = new PiHoleClient(app.url, findAppProperty(app, 'apiKey'));
  const summary = await piHole.getSummary();

  return {
    domainsBeingBlocked: summary.domains_being_blocked,
    adsBlockedToday: summary.ads_blocked_today,
    dnsQueriesToday: summary.dns_queries_today,
    status: {
      status: summary.status,
      appId: app.id,
    },
    adsBlockedTodayPercentage: summary.ads_percentage_today,
  };
};

const collectAdGuardSummary = async (app: ConfigAppType) => {
  const adGuard = new AdGuard(
    app.url,
    findAppProperty(app, 'username'),
    findAppProperty(app, 'password')
  );

  const stats = await adGuard.getStats();
  const status = await adGuard.getStatus();
  const countFilteredDomains = await adGuard.getCountFilteringDomains();

  const blockedQueriesToday = stats.blocked_filtering.reduce((prev, sum) => prev + sum, 0);
  const queriesToday = stats.dns_queries.reduce((prev, sum) => prev + sum, 0);

  return {
    domainsBeingBlocked: countFilteredDomains,
    adsBlockedToday: blockedQueriesToday,
    dnsQueriesToday: queriesToday,
    status: {
      status: status.protection_enabled ? ('enabled' as const) : ('disabled' as const),
      appId: app.id,
    },
    adsBlockedTodayPercentage: (queriesToday / blockedQueriesToday) * 100,
  };
};
