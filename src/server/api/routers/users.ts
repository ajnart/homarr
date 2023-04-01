import { z } from 'zod';
import { prisma } from '../../db';
import { createUnionSchema } from '../../helpers/zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

const userFilters = ['all', 'enabled', 'archived', 'admin', 'non-admin'] as const;

export const usersRouter = createTRPCRouter({
  filters: publicProcedure.query(() => {
    return userFilters;
  }),
  list: publicProcedure
    .input(
      z.object({
        filter: createUnionSchema(userFilters),
        search: z.string().optional(),
      })
    )
    .query(({ input }) => {
      return prisma.user.findMany({
        where: {
          AND: [
            {
              username: {
                contains: input.search?.toLowerCase() ?? '',
              },
            },
            constructWhereFilter(input.filter),
          ],
        },
        select: {
          id: true,
          username: true,
          lastActiveAt: true,
          isAdmin: true,
          isEnabled: true,
          createdAt: true,
          updatedAt: true,
          /* NEVER select the password! */
          password: false,
        },
      });
    }),
});

const constructWhereFilter = (filter: (typeof userFilters)[number]) => {
  if (filter === 'all') {
    return {};
  }

  if (filter === 'enabled' || filter === 'archived') {
    return { isEnabled: filter === 'enabled' };
  }

  if (filter === 'admin' || filter === 'non-admin') {
    return { isAdmin: filter === 'admin' };
  }

  return {};
};
