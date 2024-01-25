import axios from 'axios';
import Consola from 'consola';
import { z } from 'zod';
import { checkIntegrationsType, findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { IntegrationType } from '~/types/app';

import { createTRPCRouter, protectedProcedure } from '../trpc';

const makeIndexerRequest = async (appUrl, apiKey, endpoint) => {
  try {
    const response = await axios.get(`${appUrl.origin}/api/v1/${endpoint}`, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });
    return response.data;
  } catch (error) {
    Consola.error(`Failed to make request to ${endpoint}: ${error.message}`);
    throw error;
  }
};

export const indexerManagerRouter = createTRPCRouter({
  indexers: protectedProcedure
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
      );
      if (!app) {
        Consola.error(
          `Failed to process request to indexer app (${app?.id}): App not found. Please check the configuration.`
        );
      }
      const apiKey = findAppProperty(app, 'apiKey');
      if (!apiKey) {
        Consola.error(
          `Failed to process request to indexer app (${app.id}): API key not found. Please check the configuration.`
        );
        return null;
      }

      const appUrl = new URL(app.url);
      try {
        const [indexerData, indexerStatus] = await Promise.all([
          makeIndexerRequest(appUrl, apiKey, 'indexer'),
          makeIndexerRequest(appUrl, apiKey, 'indexerstatus'),
        ]);
        return { indexer: indexerData, indexerStatus };
      } catch (error) {
        Consola.error(`Failed to process request to indexer app (${app.id}): ${error.message}`);
        return null;
      }
    }),

  status: protectedProcedure
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
      );
      const apiKey = findAppProperty(app, 'apiKey');
      if (!app || !apiKey) {
        Consola.error(
          `failed to process request to app '${app?.integration}' (${app?.id}). Please check api key`
        );
      }

      const appUrl = new URL(app.url);
      const status = await axios
        .get(`${appUrl.origin}/api/v1/indexerstatus`, {
          headers: {
            'X-Api-Key': apiKey,
          },
        })
        .then((res) => res.data);
      return status;
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
      );
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
        .then((res) => res.data);

      return result;
    }),
});
