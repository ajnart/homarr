import axios from 'axios';
import { z } from 'zod';
import { checkIntegrationsType } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { ConfigAppType } from '~/types/app';

const inputSchema = z.object({
  appId: z.string(),
  configName: z.string(),
});

const getStatisticsSchema = z.object({
  totalFileCount: z.number(),
  totalTranscodeCount: z.number(),
  totalHealthCheckCount: z.number(),
  table3Count: z.number(),
  table6Count: z.number(),
  table1Count: z.number(),
  table4Count: z.number(),
});

export type TdarrStatistics = {
  totalFileCount: number;
  totalTranscodes: number;
  totalHealthChecks: number;
  failedTranscodeCount: number;
  failedHealthCheckCount: number;
  stagedTranscodes: number;
  stagedHealthChecks: number;
}

const getNodesResponseSchema = z.record(z.string(), z.object({
  _id: z.string(),
  nodeName: z.string(),
  nodePaused: z.boolean(),
  workers: z.record(z.string(), z.object({
    _id: z.string(),
    file: z.string(),
    fps: z.number(),
    percentage: z.number(),
    ETA: z.string(),
    job: z.object({
      type: z.string(),
    }),
    status: z.string(),
    lastPluginDetails: z.object({
      number: z.string(),
    }).optional(),
    originalfileSizeInGbytes: z.number(),
    estSize: z.number(),
    outputFileSizeInGbytes: z.number(),
  })),
}));

export type TdarrWorker = {
  id: string;
  file: string;
  fps: number;
  percentage: number;
  ETA: string;
  jobType: string;
  status: string;
  step: string;
  originalSize: number;
  estimatedSize: number;
  outputSize: number;
}

const getFilesSchema = z.array(
  z.object({
    file: z.string(),
    TranscodeDecisionMaker: z.string(),
    file_size: z.number(),
  }),
);

export type TdarrFile = {
  file: string;
  status: 'Queued' | 'Transcode success' | 'Transcode error' | string;
  size: number;
};

const getStagedFilesSchema = z.array(
  z.object({
    originalLibraryFile: z.object({
      file: z.string(),
      file_size: z.number(),
    }),
    status: z.string(),
  }),
);

export type TdarrStagedFile = {
  file: string;
  status: 'processing' | 'copying' | 'accepted' | string;
  size: number;
};

export const tdarrRouter = createTRPCRouter({
  statistics: publicProcedure
    .input(inputSchema)
    .query(async ({ input }): Promise<TdarrStatistics> => {
      const app = getTdarrApp(input.appId, input.configName);
      const appUrl = new URL('api/v2/cruddb', app.url);

      const body = {
        data: {
          collection: 'StatisticsJSONDB',
          mode: 'getById',
          docID: 'statistics',
        },
      };

      const res = await axios.post(appUrl.toString(), body);
      const data = getStatisticsSchema.parse(res.data);

      return {
        totalFileCount: data.totalFileCount,
        totalTranscodes: data.totalTranscodeCount,
        totalHealthChecks: data.totalHealthCheckCount,
        failedTranscodeCount: data.table3Count,
        failedHealthCheckCount: data.table6Count,
        stagedTranscodes: data.table1Count,
        stagedHealthChecks: data.table4Count,
      };
    }),

  workers: publicProcedure
    .input(inputSchema)
    .query(async ({ input }): Promise<TdarrWorker[]> => {
      const app = getTdarrApp(input.appId, input.configName);
      const appUrl = new URL('api/v2/get-nodes', app.url);

      const res = await axios.get(appUrl.toString());
      const data = getNodesResponseSchema.parse(res.data);

      const nodes = Object.values(data);
      const workers = nodes.flatMap(node => {
        return Object.values(node.workers);
      });

      return workers.map(worker => ({
        id: worker._id,
        file: worker.file,
        fps: worker.fps,
        percentage: worker.percentage,
        ETA: worker.ETA,
        jobType: worker.job.type,
        status: worker.status,
        step: worker.lastPluginDetails?.number ?? '',
        originalSize: worker.originalfileSizeInGbytes * 1_000_000, // file_size is in MB, convert to bytes,
        estimatedSize: worker.estSize * 1_000_000, // file_size is in MB, convert to bytes,
        outputSize: worker.outputFileSizeInGbytes * 1_000_000, // file_size is in MB, convert to bytes,
      }));
    }),

  getFiles: publicProcedure
    .input(inputSchema)
    .query(async ({ input }): Promise<TdarrFile[]> => {
      const app = getTdarrApp(input.appId, input.configName);
      const appUrl = new URL('api/v2/cruddb', app.url);

      const body = {
        data: {
          collection: 'FileJSONDB',
          mode: 'getAll',
        },
      };

      const res = await axios.post(appUrl.toString(), body);
      const data = getFilesSchema.parse(res.data);

      return data.map(file => ({
        file: file.file,
        status: file.TranscodeDecisionMaker,
        size: file.file_size * 1_000_000, // file_size is in MB, convert to bytes
      }));
    }),

  getStagedFiles: publicProcedure
    .input(inputSchema)
    .query(async ({ input }): Promise<TdarrStagedFile[]> => {
      const app = getTdarrApp(input.appId, input.configName);
      const appUrl = new URL('api/v2/cruddb', app.url);

      const body = {
        data: {
          collection: 'StagedJSONDB',
          mode: 'getAll',
        },
      };

      const res = await axios.post(appUrl.toString(), body);
      const data = getStagedFilesSchema.parse(res.data);

      return data.map(file => ({
        file: file.originalLibraryFile.file,
        status: file.status,
        size: file.originalLibraryFile.file_size * 1_000_000, // file_size is in MB, convert to bytes
      }));
    }),
});

function getTdarrApp(appId: string, configName: string): ConfigAppType {
  const config = getConfig(configName);

  const app = config.apps.find((x) => x.id === appId);

  if (!app) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `[Tdarr integration] App with ID "${appId}" could not be found.`,
    });
  }

  if (!checkIntegrationsType(app.integration, ['tdarr'])) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `[Tdarr integration] App with ID "${appId}" is not using the Tdarr integration.`,
    });
  }

  return app;
}
