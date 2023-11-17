import { TRPCError } from '@trpc/server';
import axios from 'axios';
import Consola from 'consola';
import { z } from 'zod';
import { getWidgetAsync } from '~/server/db/queries/widget';
import { AppIntegrationType } from '~/types/app';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const calendarRouter = createTRPCRouter({
  medias: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        widgetId: z.string(),
        month: z.number().min(1).max(12),
        year: z.number().min(1900).max(2300),
        options: z.object({
          showUnmonitored: z.boolean().optional().default(false),
        }),
      })
    )
    .query(async ({ input, ctx }) => {
      const widget = await getWidgetAsync(
        input.boardId,
        input.widgetId,
        ctx.session?.user,
        'calendar'
      );

      if (!widget) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Widget not found',
        });
      }

      const integrationTypeEndpointMap = new Map<AppIntegrationType['type'], string>([
        ['sonarr', '/api/v3/calendar'],
        ['radarr', '/api/v3/calendar'],
        ['lidarr', '/api/v1/calendar'],
        ['readarr', '/api/v1/calendar'],
      ]);

      const promises = widget.integrations.map(async (integration) => {
        const endpoint = integrationTypeEndpointMap.get(integration.sort);
        if (!endpoint) {
          return {
            sort: integration.sort,
            items: [],
            success: false,
          };
        }

        // Get the origin URL
        let { href: origin } = new URL(integration.url);
        if (origin.endsWith('/')) {
          origin = origin.slice(0, -1);
        }

        const start = new Date(input.year, input.month - 1, 1); // First day of month
        const end = new Date(input.year, input.month, 0); // Last day of month

        const apiKey = integration.secrets.find((x) => x.key === 'apiKey')?.value;
        if (!apiKey) return { sort: integration.sort, items: [], success: false };
        const url = new URL(`${origin}${endpoint}`);
        url.searchParams.set('apiKey', apiKey);
        url.searchParams.set('end', end.toISOString());
        url.searchParams.set('start', start.toISOString());
        url.searchParams.set('includeSeries', true.toString());
        url.searchParams.set('includeEpisodeFile', true.toString());
        url.searchParams.set('includeEpisodeImages', true.toString());
        url.searchParams.set('unmonitored', input.options.showUnmonitored.toString());

        return axios
          .get(url.toString())
          .then((x) => ({ sort: integration.sort, items: x.data as unknown[], success: true }))
          .catch((err) => {
            Consola.error(
              `failed to process request for integration '${integration.sort}' (${integration.name}): ${err}`
            );
            return {
              sort: integration.sort,
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
        tvShows: medias.filter((m) => m.sort === 'sonarr').flatMap((m) => m.items),
        movies: medias.filter((m) => m.sort === 'radarr').flatMap((m) => m.items),
        books: medias.filter((m) => m.sort === 'readarr').flatMap((m) => m.items),
        musics: medias.filter((m) => m.sort === 'lidarr').flatMap((m) => m.items),
        totalCount: medias.reduce((p, c) => p + c.items.length, 0),
      };
    }),
});
