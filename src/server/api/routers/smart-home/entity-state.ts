import { TRPCError } from '@trpc/server';

import { ZodError, z } from 'zod';


import { createTRPCRouter, protectedProcedure } from '../../trpc';

import { findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { HomeAssistantSingleton } from '~/tools/singleton/HomeAssistantSingleton';

export const smartHomeEntityStateRouter = createTRPCRouter({
  retrieveStatus: protectedProcedure
    .input(
      z.object({
        configName: z.string(),
        entityId: z.string().regex(/^[A-Za-z0-9-_\.]+$/)
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const instances = config.apps.filter((app) => app.integration?.type == 'homeAssistant');

      for (var instance of instances) {
        const url = new URL(instance.url);
        const client = HomeAssistantSingleton.getOrSet(url, findAppProperty(instance, 'apiKey'));
        const state = await client.getEntityState(input.entityId);
        
        if (!state.success) {
          if (!(state.error instanceof ZodError)) {
            continue;
          }
          // Consola.error('Unable to handle entity state: ', state.error);
          throw new TRPCError({
            code: 'NOT_IMPLEMENTED',
            message: `Unable to handle Home Assistant entity state. This may be due to malformed response or unknown entity type. Check log for details`
          });
        }

        if(!state.data) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Home Assistant: Unable to connect to app '${instance.id}'. Check logs for details`
          });
        }

        return state.data;
      }

      return null;
    }),
});
