import { TRPCError } from '@trpc/server';
import axios from 'axios';
import Consola from 'consola';
import { z } from 'zod';
import { MovieResult } from '~/modules/overseerr/Movie';
import { OriginalLanguage, Result } from '~/modules/overseerr/SearchResult';
import { TvShowResult } from '~/modules/overseerr/TvShow';
import { getConfig } from '~/tools/config/getConfig';

import { protectedProcedure, createTRPCRouter, publicProcedure } from '../trpc';

export const overseerrRouter = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        configName: z.string(),
        integration: z.enum(['overseerr', 'jellyseerr']),
        query: z.string().or(z.undefined()),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const app = config.apps.find((app) => app.integration?.type === input.integration);

      if (input.query === '' || input.query === undefined) {
        return [];
      }

      const apiKey = app?.integration?.properties.find((x) => x.field === 'apiKey')?.value;
      if (!app || !apiKey) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Wrong request',
        });
      }
      const appUrl = new URL(app.url);
      const data = await axios
        .get(`${appUrl.origin}/api/v1/search?query=${input.query}`, {
          headers: {
            // Set X-Api-Key to the value of the API key
            'X-Api-Key': apiKey,
          },
        })
        .then((res) => res.data.results as Result[]);

      return data.slice(0, input.limit);
    }),
  byId: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        id: z.number(),
        type: z.union([z.literal('movie'), z.literal('tv')]),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);
      const app = config.apps.find(
        (app) => app.integration?.type === 'overseerr' || app.integration?.type === 'jellyseerr'
      );
      const apiKey = app?.integration?.properties.find((x) => x.field === 'apiKey')?.value;

      if (!apiKey) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No app found',
        });
      }

      const appUrl = new URL(app.url);

      if (input.type === 'movie') {
        const movie = await axios
          .get(`${appUrl.origin}/api/v1/movie/${input.id}`, {
            headers: {
              // Set X-Api-Key to the value of the API key
              'X-Api-Key': apiKey,
            },
          })
          .then((res) => res.data as MovieResult)
          .catch((err) => {
            Consola.error(err);
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Something went wrong',
            });
          });
        return movie;
      }

      const tv = await axios
        .get(`${appUrl.origin}/api/v1/tv/${input.id}`, {
          headers: {
            // Set X-Api-Key to the value of the API key
            'X-Api-Key': apiKey,
          },
        })
        .then((res) => res.data as TvShowResult)
        .catch((err) => {
          Consola.error(err);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
          });
        });
      return tv;
    }),
  request: publicProcedure
    .input(
      z
        .object({
          configName: z.string(),
          id: z.number(),
        })
        .and(
          z
            .object({
              seasons: z.array(z.number()),
              type: z.literal('tv'),
            })
            .or(
              z.object({
                type: z.literal('movie'),
              })
            )
        )
    )
    .mutation(async ({ input }) => {
      const config = getConfig(input.configName);
      const app = config.apps.find(
        (app) => app.integration?.type === 'overseerr' || app.integration?.type === 'jellyseerr'
      );
      const apiKey = app?.integration?.properties.find((x) => x.field === 'apiKey')?.value;
      if (!apiKey) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No app found',
        });
      }

      const appUrl = new URL(app.url);
      Consola.info('Got an Overseerr request with these arguments', {
        mediaType: input.type,
        mediaId: input.id,
        seasons: input.type === 'tv' ? input.seasons : undefined,
      });
      return axios
        .post(
          `${appUrl.origin}/api/v1/request`,
          {
            mediaType: input.type,
            mediaId: input.id,
            seasons: input.type === 'tv' ? input.seasons : undefined,
          },
          {
            headers: {
              // Set X-Api-Key to the value of the API key
              'X-Api-Key': apiKey,
            },
          }
        )
        .then((res) => res.data)
        .catch((err) => {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
          });
        });
    }),
  decide: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        id: z.number(),
        isApproved: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const config = getConfig(input.configName);
      Consola.log(
        `Got a request to ${input.isApproved ? 'approve' : 'decline'} a request`,
        input.id
      );
      const app = config.apps.find(
        (app) => app.integration?.type === 'overseerr' || app.integration?.type === 'jellyseerr'
      );

      const apiKey = app?.integration?.properties.find((x) => x.field === 'apiKey')?.value;
      if (!apiKey) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No app found',
        });
      }
      const appUrl = new URL(app.url);
      const action = input.isApproved ? 'approve' : 'decline';
      return axios
        .post(
          `${appUrl.origin}/api/v1/request/${input.id}/${action}`,
          {},
          {
            headers: {
              'X-Api-Key': apiKey,
            },
          }
        )
        .then((res) => res.data)
        .catch((err) => {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
          });
        });
    }),
});
