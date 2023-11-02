import axios from 'axios';
import Consola from 'consola';
import { z } from 'zod';
import { checkIntegrationsType } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { AppIntegrationType, IntegrationType } from '~/types/app';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const calendarRouter = createTRPCRouter({
  medias: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        month: z.number().min(1).max(12),
        year: z.number().min(1900).max(2300),
        options: z.object({
          showUnmonitored: z.boolean().optional().default(false),
        }),
      })
    )
    .query(async ({ input }) => {
      const { configName, month, year, options } = input;
      const config = getConfig(configName);

      const mediaAppIntegrationTypes = [
        'sonarr',
        'radarr',
        'readarr',
        'lidarr',
      ] as const satisfies readonly IntegrationType[];
      const mediaApps = config.apps.filter((app) =>
        checkIntegrationsType(app.integration, mediaAppIntegrationTypes)
      );

      const integrationTypeEndpointMap = new Map<AppIntegrationType['type'], string>([
        ['sonarr', '/api/v3/calendar'],
        ['radarr', '/api/v3/calendar'],
        ['lidarr', '/api/v1/calendar'],
        ['readarr', '/api/v1/calendar'],
      ]);

      const promises = mediaApps.map(async (app) => {
        const integration = app.integration!;
        const endpoint = integrationTypeEndpointMap.get(integration.type);
        if (!endpoint) {
          return {
            type: integration.type,
            items: [],
            success: false,
          };
        }

        // Get the origin URL
        let { href: origin } = new URL(app.url);
        if (origin.endsWith('/')) {
          origin = origin.slice(0, -1);
        }

        const start = new Date(year, month - 1, 1); // First day of month
        const end = new Date(year, month, 0); // Last day of month

        const apiKey = integration.properties.find((x) => x.field === 'apiKey')?.value;
        if (!apiKey) return { type: integration.type, items: [], success: false };
        return axios
          .get(
            `${origin}${endpoint}?apiKey=${apiKey}&end=${end.toISOString()}&start=${start.toISOString()}&includeSeries=true&includeEpisodeFile=true&includeEpisodeImages=true&&unmonitored=${
              input.options.showUnmonitored
            }`
          )
          .then((x) => ({ type: integration.type, items: x.data as any[], success: true }))
          .catch((err) => {
            Consola.error(
              `failed to process request to app '${integration.type}' (${app.id}): ${err}`
            );
            return {
              type: integration.type,
              items: [],
              success: false,
            };
          });
      });

      const medias = await Promise.all(promises);

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
