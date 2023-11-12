import { TRPCError } from '@trpc/server';
import Consola from 'consola';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { configExists } from '~/tools/config/configExists';
import { getConfig } from '~/tools/config/getConfig';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { BackendConfigType, ConfigType } from '~/types/config';
import { IRssWidget } from '~/widgets/rss/RssWidgetTile';

import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc';

export const configNameSchema = z.string().regex(/^[a-zA-Z0-9-_]+$/);

export const configRouter = createTRPCRouter({
  delete: adminProcedure
    .input(
      z.object({
        name: configNameSchema,
      })
    )
    .mutation(async ({ input }) => {
      if (input.name.toLowerCase() === 'default') {
        Consola.error("Rejected config deletion because default configuration can't be deleted");
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Default config can't be deleted",
        });
      }

      // Loop over all the files in the /data/configs directory
      // Get all the configs in the /data/configs folder
      // All the files that end in ".json"
      const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));
      // Match one file if the configProperties.name is the same as the slug
      const matchedFile = files.find((file) => {
        const config = JSON.parse(fs.readFileSync(path.join('data/configs', file), 'utf8'));
        return config.configProperties.name === input.name;
      });

      // If the target is not in the list of files, return an error
      if (!matchedFile) {
        Consola.error(
          `Rejected config deletion request because config name '${input.name}' was not included in present configurations`
        );
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target not found',
        });
      }

      // Delete the file
      fs.unlinkSync(path.join('data/configs', matchedFile));
      Consola.info(`Successfully deleted configuration '${input.name}' from your file system`);
      return {
        message: 'Configuration deleted with success',
      };
    }),
  save: adminProcedure
    .input(
      z.object({
        name: configNameSchema,
        config: z.custom<ConfigType>((x) => !!x && typeof x === 'object'),
      })
    )
    .mutation(async ({ input }) => {
      Consola.info(`Saving updated configuration of '${input.name}' config.`);

      const previousConfig = getConfig(input.name);

      let newConfig: BackendConfigType = {
        ...input.config,
        apps: [
          ...input.config.apps.map((app) => ({
            ...app,
            network: {
              ...app.network,
              statusCodes:
                app.network.okStatus === undefined
                  ? app.network.statusCodes
                  : app.network.okStatus.map((x) => x.toString()),
              okStatus: undefined,
            },
            integration: {
              ...app.integration,
              properties: app.integration.properties.map((property) => {
                if (property.type === 'public') {
                  return {
                    field: property.field,
                    type: property.type,
                    value: property.value,
                  };
                }

                const previousApp = previousConfig.apps.find(
                  (previousApp) => previousApp.id === app.id
                );

                const previousProperty = previousApp?.integration?.properties.find(
                  (previousProperty) => previousProperty.field === property.field
                );

                if (property.value !== undefined && property.value !== null) {
                  Consola.info(
                    'Detected credential change of private secret. Value will be overwritten in configuration'
                  );
                  return {
                    field: property.field,
                    type: property.type,
                    value: property.value,
                  };
                }

                return {
                  field: property.field,
                  type: property.type,
                  value: previousProperty?.value,
                };
              }),
            },
          })),
        ],
        // Settings can only be changed in the configuration file
        settings: previousConfig.settings,
      };

      newConfig = {
        ...newConfig,
        widgets: [
          ...newConfig.widgets.map((x) => {
            if (x.type !== 'rss') {
              return x;
            }

            const rssWidget = x as IRssWidget;

            return {
              ...rssWidget,
              properties: {
                ...rssWidget.properties,
                rssFeedUrl:
                  typeof rssWidget.properties.rssFeedUrl === 'string'
                    ? [rssWidget.properties.rssFeedUrl]
                    : rssWidget.properties.rssFeedUrl,
              },
            } as IRssWidget;
          }),
        ],
      };

      // Save the body in the /data/config folder with the slug as filename
      const targetPath = path.join('data/configs', `${input.name}.json`);
      fs.writeFileSync(targetPath, JSON.stringify(newConfig, null, 2), 'utf8');

      Consola.debug(`Config '${input.name}' has been updated and flushed to '${targetPath}'.`);

      return {
        message: 'Configuration saved with success',
      };
    }),
  byName: publicProcedure
    .input(
      z.object({
        name: configNameSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      if (!configExists(input.name)) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Configuration not found',
        });
      }

      return await getFrontendConfig(input.name);
    }),
});
