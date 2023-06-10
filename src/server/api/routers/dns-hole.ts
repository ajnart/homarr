import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { getConfig } from '~/tools/config/getConfig';
import { AdGuard } from '~/tools/server/sdk/adGuard/adGuard';
import { ConfigAppType } from '~/types/app';
import { findAppProperty } from '~/tools/client/app-properties';
import { PiHoleClient } from '~/tools/server/sdk/pihole/piHole';

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
  const pihole = new PiHoleClient(app.url, findAppProperty(app, 'password'));

  if (enable) {
    await pihole.enable();
    return;
  }

  await pihole.disable();
};
