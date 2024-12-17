import { MantineTheme } from '@mantine/core';
import { TRPCError } from '@trpc/server';
import Consola from 'consola';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { configExists } from '~/tools/config/configExists';
import { getConfig } from '~/tools/config/getConfig';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { BackendConfigType, ConfigType } from '~/types/config';
import { boardCustomizationSchema, configNameSchema } from '~/validations/boards';
import { IRssWidget } from '~/widgets/rss/RssWidgetTile';

import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc';

export const configRouter = createTRPCRouter({
  delete: adminProcedure
    .meta({ openapi: { method: 'DELETE', path: '/configs', tags: ['config'] } })
    .input(
      z.object({
        name: configNameSchema,
      })
    )
    .output(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      if (input.name === 'default') {
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
        create: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.create && configExists(input.name))
        throw new TRPCError({ message: 'Config already exists.', code: 'CONFLICT' });

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
    .meta({
      openapi: {
        method: 'GET',
        path: '/configs/byName',
        tags: ['config'],
        deprecated: true,
        summary:
          'Retrieve content of the JSON configuration. Deprecated because JSON will be removed in a future version and be replaced with a relational database.',
      },
    })
    .input(
      z.object({
        name: configNameSchema,
      })
    )
    .output(z.custom<ConfigType>())
    .query(async ({ ctx, input }) => {
      if (!configExists(input.name)) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Configuration not found',
        });
      }

      return await getFrontendConfig(input.name);
    }),
  saveCustomization: adminProcedure
    .input(boardCustomizationSchema.and(z.object({ name: configNameSchema })))
    .output(z.void())
    .mutation(async ({ input }) => {
      const previousConfig = getConfig(input.name);
      const newConfig = {
        ...previousConfig,
        settings: {
          ...previousConfig.settings,
          access: {
            ...previousConfig.settings.access,
            allowGuests: input.access.allowGuests,
          },
          customization: {
            ...previousConfig.settings.customization,
            appOpacity: input.appearance.opacity,
            backgroundImageUrl: input.appearance.backgroundSrc,
            backgroundImageAttachment: input.appearance.backgroundImageAttachment,
            backgroundImageRepeat: input.appearance.backgroundImageRepeat,
            backgroundImageSize: input.appearance.backgroundImageSize,
            colors: {
              primary: input.appearance.primaryColor,
              secondary: input.appearance.secondaryColor,
              shade: input.appearance.shade as MantineTheme['primaryShade'],
            },
            customCss: input.appearance.customCss,
            faviconUrl: input.pageMetadata.faviconSrc,
            gridstack: {
              columnCountSmall: input.gridstack.sm,
              columnCountMedium: input.gridstack.md,
              columnCountLarge: input.gridstack.lg,
            },
            layout: {
              ...previousConfig.settings.customization.layout,
              enabledLeftSidebar: input.layout.leftSidebarEnabled,
              enabledRightSidebar: input.layout.rightSidebarEnabled,
              enabledPing: input.layout.pingsEnabled,
            },
            logoImageUrl: input.pageMetadata.logoSrc,
            metaTitle: input.pageMetadata.metaTitle,
            pageTitle: input.pageMetadata.pageTitle,
          },
        },
      } satisfies BackendConfigType;
      const targetPath = path.join('data/configs', `${input.name}.json`);
      fs.writeFileSync(targetPath, JSON.stringify(newConfig, null, 2), 'utf8');
    }),
  // publicProcedure is not optimal, but should be fince, since there is no input and output data nor can you break the config
  updateConfigurationSchemaToLatest: publicProcedure.mutation(async () => {
    const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

    console.log('updating the schema version of', files.length, 'configurations');

    for (const file of files) {
      const name = file.replace('.json', '');
      const config = await getFrontendConfig(name);

      config.schemaVersion = 2;
      const targetPath = `data/configs/${name}.json`;
      fs.writeFileSync(targetPath, JSON.stringify(config, null, 2), 'utf8');

      console.log('updated', name, 'to schema version', config.schemaVersion);
    }
  }),
});
