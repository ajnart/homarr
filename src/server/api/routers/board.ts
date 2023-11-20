import { TRPCError } from '@trpc/server';
import fs from 'fs';
import { z } from 'zod';
import { getDefaultBoardAsync } from '~/server/db/queries/userSettings';
import { configExists } from '~/tools/config/configExists';
import { getConfig } from '~/tools/config/getConfig';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { generateDefaultApp } from '~/tools/shared/app';

import { adminProcedure, createTRPCRouter, protectedProcedure } from '../trpc';
import { configNameSchema } from './config';

export const boardRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

    const defaultBoard = await getDefaultBoardAsync(ctx.session.user.id, 'default');

    return await Promise.all(
      files.map(async (file) => {
        const name = file.replace('.json', '');
        const config = await getFrontendConfig(name);

        const countApps = config.apps.length;

        return {
          name: name,
          allowGuests: config.settings.access.allowGuests,
          countApps: countApps,
          countWidgets: config.widgets.length,
          countCategories: config.categories.length,
          isDefaultForUser: name === defaultBoard,
        };
      })
    );
  }),
  addAppsForContainers: adminProcedure
    .input(
      z.object({
        boardName: configNameSchema,
        apps: z.array(
          z.object({
            name: z.string(),
            icon: z.string().optional(),
            port: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      if (!(await configExists(input.boardName))) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board not found',
        });
      }
      const config = await getConfig(input.boardName);
      const lowestWrapper = config?.wrappers.sort((a, b) => a.position - b.position)[0];

      const newConfig = {
        ...config,
        apps: [
          ...config.apps,
          ...input.apps.map((container) => {
            const defaultApp = generateDefaultApp(lowestWrapper.id);
            const address = container.port
              ? `http://localhost:${container.port}`
              : 'http://localhost';
            return {
              ...defaultApp,
              name: container.name,
              url: address,
              appearance: {
                ...defaultApp.appearance,
                iconUrl: container.icon,
              },
              behaviour: {
                ...defaultApp.behaviour,
                externalUrl: address,
              },
            };
          }),
        ],
      };

      const targetPath = `data/configs/${input.boardName}.json`;
      fs.writeFileSync(targetPath, JSON.stringify(newConfig, null, 2), 'utf8');
    }),
});
