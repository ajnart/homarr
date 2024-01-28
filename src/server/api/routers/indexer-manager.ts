import axios from 'axios';
import Consola from 'consola';
import { z } from 'zod';
import { checkIntegrationsType, findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { IntegrationType } from '~/types/app';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const indexerManagerRouter = createTRPCRouter({
  indexers: publicProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);
      const indexerAppIntegrationTypes = ['prowlarr'] as const satisfies readonly IntegrationType[];
      const app = config.apps.find((app) =>
        checkIntegrationsType(app.integration, indexerAppIntegrationTypes)
      )!;
      const apiKey = findAppProperty(app, 'apiKey');
      if (!app || !apiKey) {
        Consola.error(
          `Failed to process request to indexer app (${app.id}): API key not found. Please check the configuration.`
        );
      }

      const appUrl = new URL(app.url);
      const data = await axios
        .get(`${appUrl.origin}/api/v1/indexer`, {
          headers: {
            'X-Api-Key': apiKey,
          },
        })
        .then((res) => res.data);
      return data;
    }),

  statuses: publicProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);
      const indexerAppIntegrationTypes = ['prowlarr'] as const satisfies readonly IntegrationType[];
      const app = config.apps.find((app) =>
        checkIntegrationsType(app.integration, indexerAppIntegrationTypes)
      )!;
      const apiKey = findAppProperty(app, 'apiKey');
      if (!app || !apiKey) {
        Consola.error(
          `Failed to process request to indexer app (${app.id}): API key not found. Please check the configuration.`
        );
      }

      const appUrl = new URL(app.url);
      const data = await axios
        .get(`${appUrl.origin}/api/v1/indexerstatus`, {
          headers: {
            'X-Api-Key': apiKey,
          },
        })
        .then((res) => res.data);
      return data;
    }),

  testAllIndexers: protectedProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const config = getConfig(input.configName);
      const indexerAppIntegrationTypes = ['prowlarr'] as const satisfies readonly IntegrationType[];
      const app = config.apps.find((app) =>
        checkIntegrationsType(app.integration, indexerAppIntegrationTypes)
      )!;
      const apiKey = findAppProperty(app, 'apiKey');
      if (!app || !apiKey) {
        Consola.error(
          `failed to process request to app '${app?.integration}' (${app?.id}). Please check api key`
        );
      }

      const appUrl = new URL(app.url);
      const result = await axios
        .post(`${appUrl.origin}/api/v1/indexer/testall`, null, {
          headers: {
            'X-Api-Key': apiKey,
          },
        })
        .then((res) => res.data)
        .catch((err: any) => err.response.data);

      return result;
    }),
});
