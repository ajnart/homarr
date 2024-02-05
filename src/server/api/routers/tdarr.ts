import { z, ZodObject } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';
import { getConfig } from '~/tools/config/getConfig';
import { checkIntegrationsType } from '~/tools/client/app-properties';
import { TRPCError } from '@trpc/server';

const tdarrStatisticsSchema = z.object({
  table1Count: z.number(), // Queued Count
  table3Count: z.number(), // Errored Count
});

const tdarrNodesSchema = z.instanceof(ZodObject); // equivalent to 'any'

const tdarrFilesSchema = z.array(z.object({
  file: z.string(),
  TranscodeDecisionMaker: z.string(),
  file_size: z.number(),
}));

const tdarrStagedFilesSchema = z.array(z.object({
  originalLibraryFile: z.object({
    file: z.string(),
    file_size: z.number()
  }),
  status: z.string()
}));

export const tdarrRouter = createTRPCRouter({
  getStatistics: publicProcedure
    .input(z.object({
      appId: z.string(),
      configName: z.string(),
    }))
    .output(tdarrStatisticsSchema)
    .query(async ({ input }) => {
      const app = getTdarrApp(input.appId, input.configName);

      const res = await tdarrApi(app.url, {
        collection: 'StatisticsJSONDB',
        mode: 'getById',
        docID: 'statistics',
      });
      return await res.json();
    }),
  getNodes: publicProcedure
    .input(z.object({
      appId: z.string(),
      configName: z.string(),
    }))
    .output(tdarrNodesSchema)
    .query(async ({ input }) => {
      const app = getTdarrApp(input.appId, input.configName);

      const res = await tdarrApi(app.url, {
        collection: 'NodeJSONDB',
        mode: 'getAll',
      });
      return await res.json();
    }),
  getFiles: publicProcedure
    .input(z.object({
      appId: z.string(),
      configName: z.string(),
    }))
    .output(tdarrFilesSchema)
    .query(async ({ input }) => {
      const app = getTdarrApp(input.appId, input.configName);

      const res = await tdarrApi(app.url, {
        collection: 'FileJSONDB',
        mode: 'getAll',
      });
      return await res.json();
    }),
  getStagedFiles: publicProcedure
    .input(z.object({
      appId: z.string(),
      configName: z.string(),
    }))
    .output(tdarrStagedFilesSchema)
    .query(async ({ input }) => {
      const app = getTdarrApp(input.appId, input.configName);

      const res = await tdarrApi(app.url, {
        collection: 'StagedJSONDB',
        mode: 'getAll',
      });
      return await res.json();
    }),
});

/// Helpers ///

// Tdarr API reference: https://tdarr.readme.io/reference
async function tdarrApi(baseUrl: string, bodyData: {
  collection: 'StatisticsJSONDB' | 'NodeJSONDB' | 'FileJSONDB' | 'StagedJSONDB',
  mode: 'getById' | 'getAll',
  docID?: string,
  obj?: unknown,
}) {
  const url = new URL('/api/v2/cruddb', baseUrl).href;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      headers: { 'content-Type': 'application/json' },
      data: bodyData,
      timeout: 5000,
    }),
  };

  return await fetch(url, options);
}

function getTdarrApp(appId: string, configName: string) {
  const config = getConfig(configName);

  const app = config.apps.find((x) => x.id === appId);

  if (!app || !checkIntegrationsType(app.integration, ['tdarr'])) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `App with ID "${appId}" could not be found.`,
    });
  }

  return app;
}
