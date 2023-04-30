import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { registerSchema } from '~/validation/auth';

export const userRouter = createTRPCRouter({
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
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

    const user = await ctx.prisma.user.create({
      data: {
        name: input.username,
        password: hashPassword(input.password),
      },
    });

    return {
      id: user.id,
      username: user.name,
    };
  }),
  me: protectedProcedure.query(async ({ ctx }) => ctx.session.user),
});

const SALT_ROUNDS = 10;

export const hashPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
};
