import fs from 'fs';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

import { getFrontendConfig } from '~/tools/config/getFrontendConfig';

export const boardRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

    const userSettings = await ctx.prisma.userSettings.findUniqueOrThrow({
      where: {
        userId: ctx.session?.user.id
      }
    });

    return await Promise.all(
      files.map(async (file) => {
        const name = file.replace('.json', '');
        const config = await getFrontendConfig(name);

        const countApps = config.apps.length;

        return {
          name: name,
          countApps: countApps,
          countWidgets: config.widgets.length,
          countCategories: config.categories.length,
          isDefaultForUser: name === userSettings.defaultBoard
        };
      })
    );
  }),
});
