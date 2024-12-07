import { TRPCError } from '@trpc/server';
import Consola from 'consola';
import fs from 'fs';
import { z } from 'zod';
import { getDefaultBoardAsync } from '~/server/db/queries/userSettings';
import { configExists } from '~/tools/config/configExists';
import { getConfig } from '~/tools/config/getConfig';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { writeConfig } from '~/tools/config/writeConfig';
import { generateDefaultApp } from '~/tools/shared/app';
import { configNameSchema } from '~/validations/boards';

import { adminProcedure, createTRPCRouter, protectedProcedure } from '../trpc';

export const boardRouter = createTRPCRouter({
  all: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/boards/all', tags: ['board'] } })
    .input(z.void())
    .output(
      z.array(
        z.object({
          name: z.string(),
          allowGuests: z.boolean(),
          countApps: z.number().min(0),
          countWidgets: z.number().min(0),
          countCategories: z.number().min(0),
          isDefaultForUser: z.boolean(),
        })
      )
    )
    .query(async ({ ctx }) => {
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
    .meta({ openapi: { method: 'POST', path: '/boards/add-apps', tags: ['board'] } })
    .output(z.void())
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
      if (!configExists(input.boardName)) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board not found',
        });
      }
      const config = getConfig(input.boardName);
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
  renameBoard: adminProcedure
    .meta({ openapi: { method: 'PUT', path: '/boards/rename', tags: ['board'] } })
    .input(
      z.object({
        oldName: configNameSchema,
        newName: configNameSchema,
      })
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      if (input.oldName === 'default') {
        Consola.error(`Attempted to rename default configuration. Aborted deletion.`);
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Cannot rename default board',
        });
      }

      if (!configExists(input.oldName)) {
        Consola.error(`Specified configuration ${input.oldName} does not exist on file system`);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board not found',
        });
      }

      if (configExists(input.newName)) {
        Consola.error(`Target name of rename conflicts with existing board`);
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Board conflicts with existing board',
        });
      }

      const config = getConfig(input.oldName);
      config.configProperties.name = input.newName;
      writeConfig(config);
      Consola.info(`Deleting ${input.oldName} from the file system`);
      const targetPath = `data/configs/${input.oldName}.json`;
      fs.unlinkSync(targetPath);
      Consola.info(`Deleted ${input.oldName} from file system`);
    }),
  duplicateBoard: adminProcedure
    .meta({ openapi: { method: 'POST', path: '/boards/duplicate', tags: ['board'] } })
    .input(
      z.object({
        boardName: z.string(),
      })
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      if (!configExists(input.boardName)) {
        Consola.error(
          `Tried to duplicate ${input.boardName} but this configuration does not exist.`
        );
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board not found',
        });
      }

      const targetName = attemptGenerateDuplicateName(input.boardName, 10);

      Consola.info(`Target duplication name ${targetName} does not exist`);

      const config = getConfig(input.boardName);
      config.configProperties.name = targetName;
      writeConfig(config);

      Consola.info(`Wrote config to name '${targetName}'`);
    }),
});

const duplicationName = /^(\w+)\s{1}\(([0-9]+)\)$/;

const attemptGenerateDuplicateName = (baseName: string, maxAttempts: number) => {
  for (let i = 0; i < maxAttempts; i++) {
    const newName = generateDuplicateName(baseName, i);
    if (configExists(newName)) {
      continue;
    }

    return newName;
  }

  Consola.error(`Duplication name ${baseName} conflicts with an existing configuration`);
  throw new TRPCError({
    code: 'CONFLICT',
    message: 'Board conflicts with an existing board',
  });
};

const generateDuplicateName = (baseName: string, increment: number) => {
  const result = duplicationName.exec(baseName);

  if (result && result.length === 3) {
    const originalName = result.at(1);
    const counter = Number(result.at(2));
    return `${originalName} (${counter + 1 + increment})`;
  }

  return `${baseName} (2)`;
};
