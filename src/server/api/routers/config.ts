import fs from 'fs';
import path from 'path';
import Consola from 'consola';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const configRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    // Get all the configs in the /data/configs folder
    // All the files that end in ".json"
    const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));
    // Strip the .json extension from the file name
    return files.map((file) => file.replace('.json', ''));
  }),
  delete: publicProcedure
    .input(
      z.object({
        name: z.string(),
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
});
