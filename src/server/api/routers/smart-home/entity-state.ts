import { TRPCError } from '@trpc/server';
import Consola from 'consola';
import { ZodError, z } from 'zod';


import { createTRPCRouter, protectedProcedure } from '../../trpc';

import { findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { HomeAssistantSingleton } from '~/tools/singleton/HomeAssistantSingleton';
import { ISmartHomeEntityStateWidget } from '~/widgets/smart-home/entity-state/entity-state.widget';

export const smartHomeEntityStateRouter = createTRPCRouter({
  retrieveStatus: protectedProcedure
    .input(
      z.object({
        configName: z.string(),
        // TODO: passing entity ID directly can be unsafe
        entityId: z.string().regex(/^[A-Za-z0-9-_\.]+$/),
      }),
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const instances = config.apps.filter((app) => app.integration?.type == 'homeAssistant');

      for (const instance of instances) {
        const url = new URL(instance.url);
        const client = HomeAssistantSingleton.getOrSet(url, findAppProperty(instance, 'apiKey'));
        const state = await client.getEntityState(input.entityId);

        if (!state.success) {
          if (!(state.error instanceof ZodError)) {
            continue;
          }

          throw new TRPCError({
            code: 'NOT_IMPLEMENTED',
            message: `Unable to handle Home Assistant entity state. This may be due to malformed response or unknown entity type. Check log for details`,
          });
        }

        if (!state.data) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Home Assistant: Unable to connect to app '${instance.id}'. Check logs for details`,
          });
        }

        return state.data;
      }

      return null;
    }),
  triggerAutomation: protectedProcedure
    .input(z.object({
      widgetId: z.string(),
      configName: z.string(),
    })).mutation(async ({ input }) => {
      const config = getConfig(input.configName);
      const widget = config.widgets.find(widget => widget.id === input.widgetId) as ISmartHomeEntityStateWidget | null;

      if (!widget) {
        Consola.error(`Referenced widget ${input.widgetId} does not exist on backend.`);
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Referenced widget does not exist on backend',
        });
      }

      if (!widget.properties.automationId || widget.properties.automationId.length < 1) {
        Consola.error(`Referenced widget ${input.widgetId} does not have the required property set.`);
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Referenced widget does not have the required property',
        });
      }

      const instances = config.apps.filter((app) => app.integration?.type == 'homeAssistant');

      for (const instance of instances) {
        const url = new URL(instance.url);
        const client = HomeAssistantSingleton.getOrSet(url, findAppProperty(instance, 'apiKey'));
        const state = await client.triggerAutomation(widget.properties.automationId);

        if (state) {
          return true;
        }
      }

      return false;
    }),
  triggerToggle: protectedProcedure
    .input(z.object({
      widgetId: z.string(),
      configName: z.string()
    })).mutation(async ({ input }) => {
      const config = getConfig(input.configName);
      const widget = config.widgets.find(widget => widget.id === input.widgetId) as ISmartHomeEntityStateWidget | null;

      if (!widget) {
        Consola.error(`Referenced widget ${input.widgetId} does not exist on backend.`);
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Referenced widget does not exist on backend',
        });
      }

      const instances = config.apps.filter((app) => app.integration?.type == 'homeAssistant');

      for (const instance of instances) {
        const url = new URL(instance.url);
        const client = HomeAssistantSingleton.getOrSet(url, findAppProperty(instance, 'apiKey'));
        const state = await client.triggerToggle(widget.properties.entityId);

        if (state) {
          return true;
        }
      }

      return false;
    }),
});
