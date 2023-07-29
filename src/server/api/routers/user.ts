import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { hashPassword } from '~/utils/security';
import { signUpFormSchema } from '~/validations/user';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      signUpFormSchema.and(
        z.object({
          registerToken: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const token = await ctx.prisma.registrationToken.findUnique({
        where: {
          token: input.registerToken,
        },
      });

      if (!token || token.expires < new Date()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid registration token',
        });
      }

      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          name: input.username,
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = hashPassword(input.password, salt);

      const user = await ctx.prisma.user.create({
        data: {
          name: input.username,
          password: hashedPassword,
          salt: salt,
        },
      });
      await ctx.prisma.registrationToken.delete({
        where: {
          id: token.id,
        },
      });

      return {
        id: user.id,
        name: user.name,
      };
    }),
});
