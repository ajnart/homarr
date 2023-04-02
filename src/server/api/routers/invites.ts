import { z } from 'zod';
import { randomBytes } from 'crypto';
import dayjs from 'dayjs';
import { prisma } from '../../db';
import { adminProcedure, createTRPCRouter } from '../trpc';
import { addSecurityEvent } from '../../../tools/events/addSecurityEvent';

export const invitesRouter = createTRPCRouter({
  list: adminProcedure.query(async () => {
    const invites = await prisma.registrationInvite.findMany({
      select: {
        id: true,
        name: true,
        expiresAt: true,
      },
    });
    return invites;
  }),
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const in7Days = dayjs().add(7, 'day').toDate();
      const token = randomBytes(48).toString('hex');

      const invite = await prisma.registrationInvite.create({
        data: {
          name: input.name,
          expiresAt: in7Days,
          token,
        },
      });

      await addSecurityEvent('invite', { name: input.name }, ctx.session.user.id);

      return invite;
    }),
  remove: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await prisma.registrationInvite.delete({
      where: {
        id: input.id,
      },
    });
  }),
  count: adminProcedure.query(async () => {
    const count = await prisma.registrationInvite.count();
    return count;
  }),
});
