import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ADMIN_USERNAME } from '../../../constants/constants';
import { prisma } from '../../db';
import { createUnionSchema } from '../../helpers/zod';
import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc';

const userFilters = ['all', 'enabled', 'archived', 'admin', 'non-admin'] as const;

export const usersRouter = createTRPCRouter({
  filters: publicProcedure.query(() => userFilters),
  list: adminProcedure
    .input(
      z.object({
        filter: createUnionSchema(userFilters),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const users = await prisma.user.findMany({
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
      return users;
    }),
  count: adminProcedure.query(async () => {
    const count = await prisma.user.count();
    return count;
  }),
  remove: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    throwTrpcErrorWhenUserIsOwner(input.id);

    await prisma.user.delete({
      where: {
        id: input.id,
      },
    });
  }),
  archive: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    throwTrpcErrorWhenUserIsOwner(input.id);

    await prisma.user.update({
      where: {
        id: input.id,
      },
      data: {
        isEnabled: false,
      },
    });
  }),
  enable: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    throwTrpcErrorWhenUserIsOwner(input.id);

    await prisma.user.update({
      where: {
        id: input.id,
      },
      data: {
        isEnabled: true,
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

const checkIfOwnerUser = async (id: string) => {
  const user = await prisma?.user.findFirst({ where: { id } });
  return user?.username === ADMIN_USERNAME;
};

const throwTrpcErrorWhenUserIsOwner = async (id: string) => {
  if (!(await checkIfOwnerUser(id))) return;

  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'Can not unarchive owner of homarr.',
  });
};
