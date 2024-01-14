import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { z } from 'zod';
import { checkIntegrationsType } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { IntegrationType } from '~/types/app';

import { createTRPCRouter, protectedProcedure } from '../trpc';

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
      const apiKey = app?.integration?.properties.find((x) => x.field === 'apiKey')?.value;
      if (!app || !apiKey) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Wrong request',
        });
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
      const apiKey = app?.integration?.properties.find((x) => x.field === 'apiKey')?.value;

      if (!app || !apiKey) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Wrong request',
        });
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
