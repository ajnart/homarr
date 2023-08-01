import fs from 'fs';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const boardRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));
    return await Promise.all(
      files.map(async (file) => {
        const name = file.replace('.json', '');
        const config = await getFrontendConfig(name);

        const countApps = config.apps.length;

        return {
          name: name,
          countApps: countApps,
          countWidgets: config.widgets.length,
          countCategories: config.categories.length
        };
      })
    );
  }),
});
