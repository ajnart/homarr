import { TRPCError } from '@trpc/server';
import axios from 'axios';
import Consola from 'consola';
import { z } from 'zod';
import { generateClientAppSchema, mergeClientAppIntoServerApp } from '../helpers/apps';
import { mediaRequestIntegrationTypes } from '../helpers/integrations';
import { getSecretValue } from '../helpers/secrets';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { configNameSchema, getConfigData } from './config';
import { MovieResult } from '~/modules/overseerr/Movie';
import { TvShowResult } from '~/modules/overseerr/TvShow';

// TODO: add proper typing for returned data!
export const overseerrRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        configName: configNameSchema,
        app: generateClientAppSchema(mediaRequestIntegrationTypes),
        query: z.string().or(z.undefined()),
      })
    )
    .query(async ({ input }) => {
      const config = getConfigData(input.configName);

      if (!config) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Config was not found',
        });
      }

      if (input.query === '') return [];

      const mergedApp = mergeClientAppIntoServerApp(input.app, config.apps);

      const apiKey = getSecretValue(mergedApp.integration.properties, 'apiKey');
      const appUrl = new URL(mergedApp.url);
      const data = await axios
        .get(`${appUrl.origin}/api/v1/search?query=${input.query}`, {
          headers: {
            // Set X-Api-Key to the value of the API key
            'X-Api-Key': apiKey!,
          },
        })
        .then((res) => res.data);

      return data;
    }),
  byId: publicProcedure
    .input(
      z.object({
        configName: configNameSchema,
        app: generateClientAppSchema(mediaRequestIntegrationTypes),
        id: z.number(),
        type: z.union([z.literal('movie'), z.literal('tv')]),
      })
    )
    .query(async ({ input }) => {
      const apiKey = getSecretValue(input.app.integration.properties, 'apiKey');
      const appUrl = new URL(input.app.url);

      const response = await axios.get(`${appUrl.origin}/api/v1/${input.type}/${input.id}`, {
        headers: {
          // Set X-Api-Key to the value of the API key
          'X-Api-Key': apiKey!,
        },
      });

      return response.data as MovieResult | TvShowResult;
    }),
  requestMedia: publicProcedure
    .input(
      z
        .object({
          configName: configNameSchema,
          app: generateClientAppSchema(mediaRequestIntegrationTypes),
          id: z.number(),
        })
        .and(
          z
            .object({
              type: z.literal('movie'),
              seasons: z.array(z.number()),
            })
            .or(
              z.object({
                type: z.literal('tv'),
                seasons: z.undefined().or(z.array(z.number()).length(0)),
              })
            )
        )
    )
    .mutation(async ({ input }) => {
      const apiKey = getSecretValue(input.app.integration.properties, 'apiKey');
      const appUrl = new URL(input.app.url);

      Consola.info('Got an Overseerr request with these arguments', {
        mediaType: input.type,
        mediaId: input.id,
        seasons: input.seasons,
      });
      const response = await axios.post(
        `${appUrl.origin}/api/v1/request`,
        {
          mediaType: input.type,
          mediaId: input.id,
          seasons: input.seasons ?? [],
        },
        {
          headers: {
            // Set X-Api-Key to the value of the API key
            'X-Api-Key': apiKey!,
          },
        }
      );

      return response.data;
    }),
});
