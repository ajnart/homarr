import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../../trpc';
import DockerSingleton from './DockerSingleton';

export const dockerRouter = createTRPCRouter({
  containers: publicProcedure.query(async () => {
    try {
      const docker = DockerSingleton.getInstance();
      const containers = await docker.listContainers({ all: true });
      return containers;
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to get containers',
      });
    }
  }),
});
