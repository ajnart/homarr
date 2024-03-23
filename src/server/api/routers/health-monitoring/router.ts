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
        if (checkIntegrationsType(app.integration, ['proxmox', 'openmediavault'])) {
          return app.integration.type;
        }
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
      const omvApp = config.apps.find((app) =>
        checkIntegrationsType(app.integration, ['openmediavault'])
      );
      const proxApp = config.apps.find((app) =>
        checkIntegrationsType(app.integration, ['proxmox'])
      );

      if (!omvApp && !proxApp) {
        Consola.error(`No valid integrations found for health monitoring in '${input.configName}'`);
        return null;
      }

      let systemData: any;
      let clusterData: any;

      try {
        const results = await Promise.all([
          omvApp ? makeOpenMediaVaultCalls(omvApp, input) : null,
          proxApp ? makeProxmoxStatusAPICall(proxApp, input) : null,
        ]);

        for (const response of results) {
          if (response) {
            if ('systemInfo' in response && response.systemInfo != null) {
              systemData = response;
            } else if ('nodes' in response) {
              clusterData = response;
            }
          }
        }
      } catch (error) {
        Consola.error(`Error executing health monitoring requests(s): ${error}`);
        return null;
      }

      return {
        system: systemData,
        cluster: clusterData,
      };
    }),
});
