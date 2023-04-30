import Docker from 'dockerode';
import { z } from 'zod';
import { env } from '~/env.mjs';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const dockerRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const docker = getDockerInstance();
    const containers = await docker.listContainers({ all: true });
    return containers;
  }),
  start: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const docker = getDockerInstance();
      const container = docker.getContainer(input.id);
      container.start();
    }),
  stop: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const docker = getDockerInstance();
      const container = docker.getContainer(input.id);
      container.stop();
    }),

  restart: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const docker = getDockerInstance();
      const container = docker.getContainer(input.id);
      container.restart();
    }),
  remove: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const docker = getDockerInstance();
      const container = docker.getContainer(input.id);
      container.remove();
    }),
});

let dockerInstance: Docker | null = null;

const getDockerInstance = () => {
  if (dockerInstance) return dockerInstance;

  dockerInstance = new Docker({
    host: env.DOCKER_HOST,
    port: env.DOCKER_PORT,
  });
  return dockerInstance;
};
