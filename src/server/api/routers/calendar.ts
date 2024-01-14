import { z } from 'zod';
import { checkIntegrationsType } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { IntegrationType } from '~/types/app';

import { createTRPCRouter, publicProcedure } from '../trpc';
import { calendarEvents } from '~/widgets/calendar/type';
import { MediaServerCalendar } from '~/tools/server/sdk/calendar/media-server-calendar';

const supportedMediaServerIntegrationTypes = [
  'sonarr',
  'radarr',
  'readarr',
  'lidarr',
] as const satisfies readonly IntegrationType[];

export const calendarRouter = createTRPCRouter({
  getAllEvents: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        month: z.number().min(1).max(12),
        year: z.number().min(1900).max(2300),
      }),
    )
    .output(calendarEvents)
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const mediaApps = config.apps.filter((app) =>
        checkIntegrationsType(app.integration, supportedMediaServerIntegrationTypes),
      );

      const calendarResponses = await Promise.all(mediaApps.map(async (app) => {
        return await new MediaServerCalendar().getEventsByMonth(app, input.month, input.year);
      }));

      return {
        events: calendarResponses.flatMap(calendarResponse => calendarResponse.events),
      };
    }),
});
