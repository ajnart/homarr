import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import Consola from 'consola';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { configNameSchema, getConfigData } from './config';
import { ClientApp, generateClientAppSchema, mergeClientAppsIntoServerApps } from '../helpers/apps';
import {
  MediaIntegrationType,
  MediaIntegrationTypes,
  mediaIntegrationTypes,
} from '../helpers/integrations';
import { getSecretValue } from '../helpers/secrets';

export const calendarRouter = createTRPCRouter({
  medias: publicProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(1900).max(2300),
        configName: configNameSchema,
        apps: z.array(generateClientAppSchema(mediaIntegrationTypes)),
        options: z.object({
          useSonarrv4: z.boolean().optional().default(false),
        }),
      })
    )
    .query(async ({ input }) => {
      const config = getConfigData(input.configName);

      if (!config) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to find configuration',
        });
      }

      const mergedApps = mergeClientAppsIntoServerApps(input.apps, config.apps);
      const endpoints = getCalendarEndpoints(input.options.useSonarrv4);

      const medias = await Promise.all(
        mergedApps.map(async (app) => getMediasForApp(app, input.year, input.month, endpoints))
      );

      const countFailed = medias.filter((x) => !x.success).length;
      if (countFailed > 0) {
        Consola.warn(`A total of ${countFailed} apps for the calendar widget failed`);
      }

      return {
        tvShows: medias.filter((m) => m.type === 'sonarr').flatMap((m) => m.items),
        movies: medias.filter((m) => m.type === 'radarr').flatMap((m) => m.items),
        books: medias.filter((m) => m.type === 'readarr').flatMap((m) => m.items),
        musics: medias.filter((m) => m.type === 'lidarr').flatMap((m) => m.items),
        totalCount: medias.reduce((p, c) => p + c.items.length, 0),
      };
    }),
});

const getCalendarEndpoints = (useSonarrv4: boolean) =>
  new Map<MediaIntegrationType, string>([
    ['sonarr', useSonarrv4 ? '/api/v3/calendar' : '/api/calendar'],
    ['radarr', '/api/v3/calendar'],
    ['lidarr', '/api/v1/calendar'],
    ['readarr', '/api/v1/calendar'],
  ]);

const getMediasForApp = async (
  app: ClientApp<MediaIntegrationTypes>,
  year: number,
  month: number,
  endpoints: Map<MediaIntegrationType, string>
) => {
  const endpoint = endpoints.get(app.integration.type)!;
  let { href: origin } = new URL(app.url);
  if (origin.endsWith('/')) {
    origin = origin.slice(0, -1);
  }

  const start = new Date(year, month - 1, 1); // First day of month
  const end = new Date(year, month, 0); // Last day of month

  const apiKey = getSecretValue(app.integration.properties, 'apiKey');
  if (!apiKey) return { type: app.integration.type, items: [], success: false };
  return axios
    .get(
      `${origin}${endpoint}?apiKey=${apiKey}&end=${end.toISOString()}&start=${start.toISOString()}&includeSeries=true&includeEpisodeFile=true&includeEpisodeImages=true`
    )
    .then((x) => ({ type: app.integration.type, items: x.data as any[], success: true }))
    .catch((err) => {
      Consola.error(
        `failed to process request to app '${app.integration.type}' (${app.id}): ${err}`
      );
      return {
        type: app.integration.type,
        items: [],
        success: false,
      };
    });
};
