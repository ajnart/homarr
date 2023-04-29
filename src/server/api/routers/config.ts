import { TRPCError } from '@trpc/server';
import Consola from 'consola';
import { existsSync, readFileSync, readdirSync, unlinkSync } from 'fs';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { BackendConfigType, ConfigType } from '~/types/config';

const DEFAULT_CONFIG_NAME = 'default';
const CONFIG_DIRECTORY_PATH = './data/configs';
const configNameSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9\-_\s]+$/g);

export const configRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    const files = readdirSync(CONFIG_DIRECTORY_PATH).filter((file) => file.endsWith('.json'));
    // Strip the .json extension from the file name
    return files.map((file) => file.replace('.json', ''));
  }),
  byName: publicProcedure
    .input(
      z.object({
        configName: configNameSchema.default(DEFAULT_CONFIG_NAME),
      })
    )
    .query(async ({ ctx, input }) => {
      const configPath = `${CONFIG_DIRECTORY_PATH}/${input.configName}.json`;
      const isFilePresent = existsSync(configPath);

      if (!isFilePresent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Config not found',
        });
      }

      const fileData = readFileSync(configPath, 'utf-8');
      const data: BackendConfigType = JSON.parse(fileData);
      return prepareBackendConfig(data);
    }),
  deleteByName: protectedProcedure
    .input(
      z.object({
        configName: configNameSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.configName.toLowerCase() === DEFAULT_CONFIG_NAME) {
        Consola.error("Rejected config deletion because default configuration can't be deleted");

        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Default config can't be deleted",
        });
      }

      const configPath = `${CONFIG_DIRECTORY_PATH}/${input.configName}.json`;

      const isFilePresent = existsSync(configPath);

      if (!isFilePresent) {
        Consola.error(
          `Rejected config deletion request because config name '${input.configName}' was not included in present configurations`
        );

        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Config not found',
        });
      }

      unlinkSync(configPath);
      Consola.info(
        `Successfully deleted configuration '${input.configName}' from your file system`
      );
    }),
});

const prepareBackendConfig = (backendConfig: BackendConfigType): ConfigType => ({
  ...backendConfig,
  apps: backendConfig.apps.map((app) => ({
    ...app,
    integration: {
      ...(app.integration ?? null),
      type: app.integration?.type ?? null,
      properties:
        app.integration?.properties.map((property) => ({
          ...property,
          value: property.type === 'private' ? null : property.value,
          isDefined: property.value !== null,
        })) ?? [],
    },
  })),
});
