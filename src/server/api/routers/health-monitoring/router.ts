import Consola from 'consola';
import { z } from 'zod';
import { checkIntegrationsType } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';

import { createTRPCRouter, publicProcedure } from '../../trpc';
import { makeOpenMediaVaultCalls } from './openmediavault';
import { makeProxmoxStatusAPICall } from './proxmox';

export const healthMonitoringRouter = createTRPCRouter({
  integrations: publicProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);
      const apps = config.apps.map((app) => {
        if (checkIntegrationsType(app.integration, ['proxmox', 'openmediavault'])) { return app.integration.type; }
     });

      return apps;
    }),
  fetchData: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        filterNode: z.string(),
        ignoreCerts: z.boolean(),
      })
    )
    .query(async ({ input }) => {

      const config = getConfig(input.configName);
      const omvApp = config.apps.find((app) => checkIntegrationsType(app.integration, ['openmediavault']));
      const proxApp = config.apps.find((app) => checkIntegrationsType(app.integration, ['proxmox']));

      if (!omvApp && !proxApp) {
        Consola.error(`No valid integrations found for health monitoring in '${input.configName}'`);
        return null;
      }

      let systemData: any;
      let clusterData: any;

      if (omvApp) {
        const data = await makeOpenMediaVaultCalls(omvApp, input);
        if (data) { systemData = data; }
      }

      if (proxApp) {
        const data = await makeProxmoxStatusAPICall(proxApp, input);
        if (data != null) { clusterData = data; }
      }

      return {
        system: systemData,
        cluster: clusterData,
      }
    }),
});
