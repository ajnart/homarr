import Consola from 'consola';
import { z } from 'zod';
import { findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { AdGuard } from '~/tools/server/sdk/adGuard/adGuard';
import { PiHoleClient } from '~/tools/server/sdk/pihole/piHole';
import { ConfigAppType } from '~/types/app';
import { AdStatistics } from '~/widgets/dnshole/type';

import { adminProcedure, createTRPCRouter, publicProcedure } from '../../trpc';

export const dnsHoleRouter = createTRPCRouter({
  control: adminProcedure
    .input(
      z.object({
        action: z.enum(['enable', 'disable']),
        duration: z.number(),
        configName: z.string(),
        appsToChange: z.optional(z.array(z.string())),
      })
    )
    .mutation(async ({ input }) => {
      const config = getConfig(input.configName);

      const applicableApps = config.apps.filter(
        (app) =>
          app.id &&
          app.integration?.type &&
          input.appsToChange?.includes(app.id) &&
          ['pihole', 'adGuardHome'].includes(app.integration?.type)
      );

      await Promise.all(
        applicableApps.map(async (app) => {
          if (app.integration?.type === 'pihole') {
            await processPiHole(app, input.action === 'enable', input.duration);

            return;
          }

          await processAdGuard(app, input.action === 'enable', input.duration);
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

      const data = result
        .filter((x) => x !== null)
        .reduce(
          (prev: AdStatistics, curr) => ({
            domainsBeingBlocked: prev.domainsBeingBlocked + curr!.domainsBeingBlocked,
            adsBlockedToday: prev.adsBlockedToday + curr!.adsBlockedToday,
            dnsQueriesToday: prev.dnsQueriesToday + curr!.dnsQueriesToday,
            status: [...prev.status, curr!.status],
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

      data.adsBlockedTodayPercentage = data.adsBlockedToday / data.dnsQueriesToday;
      if (Number.isNaN(data.adsBlockedTodayPercentage)) {
        data.adsBlockedTodayPercentage = 0;
      }
      return data;
    }),
});

const processAdGuard = async (app: ConfigAppType, enable: boolean, duration: number = 0) => {
  const adGuard = new AdGuard(
    app.url,
    findAppProperty(app, 'username'),
    findAppProperty(app, 'password')
  );

  if (enable) {
    try {
      await adGuard.enable();
    } catch (error) {
      Consola.error((error as Error).message);
    }
    return;
  }

  try {
    await adGuard.disable(duration);
  } catch (error) {
    Consola.error((error as Error).message);
  }
};

const processPiHole = async (app: ConfigAppType, enable: boolean, duration: number = 0) => {
  const pihole = new PiHoleClient(app.url, findAppProperty(app, 'apiKey'));

  if (enable) {
    try {
      await pihole.enable();
    } catch (error) {
      Consola.error((error as Error).message);
    }
    return;
  }

  try {
    await pihole.disable(duration);
  } catch (error) {
    Consola.error((error as Error).message);
  }
};

const collectPiHoleSummary = async (app: ConfigAppType) => {
  const piHole = new PiHoleClient(app.url, findAppProperty(app, 'apiKey'));
  const summary = await piHole.getSummary().catch(() => {
    return null;
  });

  if (!summary) {
    return null;
  }

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

  const stats = await adGuard.getStats().catch(() => {
    return null;
  });

  if (!stats) {
    return null;
  }

  const status = await adGuard.getStatus();
  const countFilteredDomains = await adGuard.getCountFilteringDomains();

  const blockedQueriesToday =
    stats.time_units === 'days'
      ? stats.blocked_filtering[stats.blocked_filtering.length - 1]
      : stats.blocked_filtering.reduce((prev, sum) => prev + sum, 0);
  const queriesToday =
    stats.time_units === 'days'
      ? stats.dns_queries[stats.dns_queries.length - 1]
      : stats.dns_queries.reduce((prev, sum) => prev + sum, 0);

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
