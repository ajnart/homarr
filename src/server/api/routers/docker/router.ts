import { TRPCError } from '@trpc/server';
import Dockerode from 'dockerode';
import { z } from 'zod';

import { adminProcedure, createTRPCRouter } from '../../trpc';
import { IconRespositories } from '../icon';
import DockerSingleton from './DockerSingleton';

const dockerActionSchema = z.enum(['remove', 'start', 'stop', 'restart']);

export const dockerRouter = createTRPCRouter({
  containers: adminProcedure.query(async () => {
    try {
      const docker = new Dockerode({});
      const containers = await docker.listContainers({ all: true });
      const fetches = IconRespositories.map((rep) => rep.fetch());
      const data = await Promise.all(fetches);
      const returnedData = containers.map((container) => {
        const imageParsed = container.Image.split('/');
        // Remove the version
        const image = imageParsed[imageParsed.length - 1].split(':')[0];
        const foundIcon = data
          .flatMap((repository) =>
            repository.entries.map((entry) => ({
              ...entry,
              repository: repository.name,
            }))
          )
          .find((entry) => entry.name.toLowerCase().includes(image.toLowerCase()));

        return {
          ...container,
          icon: foundIcon?.url ?? '/public/imgs/logo/logo.svg'
        };
      });
      return returnedData;
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to get containers',
      });
    }
  }),
  action: adminProcedure
    .input(
      z.object({
        id: z.string(),
        action: dockerActionSchema,
      })
    )
    .mutation(async ({ input }) => {
      const docker = DockerSingleton.getInstance();
      // Get the container with the ID
      const container = docker.getContainer(input.id);
      if (!container) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Container not found',
        });
      }

      // Perform the action
      try {
        await startAction(container, input.action);
        return {
          statusCode: 200,
          message: `Container ${input.id} ${input.action}ed`,
        };
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Unable to ${input.action} container ${input.id}`,
        });
      }
    }),
});

const startAction = async (
  container: Dockerode.Container,
  action: z.infer<typeof dockerActionSchema>
) => {
  switch (action) {
    case 'remove':
      return container.remove();
    case 'start':
      return container.start();
    case 'stop':
      return container.stop();
    case 'restart':
      return container.restart();
    default:
      return Promise;
  }
};
