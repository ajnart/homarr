import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { hashPassword } from '~/utils/security';
import {
  colorSchemeParser,
  signUpFormSchema,
  updateSettingsValidationSchema,
} from '~/validations/user';

import { COOKIE_COLOR_SCHEME_KEY, COOKIE_LOCALE_KEY } from '../../../../data/constants';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

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
          settings: {
            create: {
              colorScheme: colorSchemeParser.parse(ctx.cookies[COOKIE_COLOR_SCHEME_KEY]),
              language: ctx.cookies[COOKIE_LOCALE_KEY] ?? 'en',
            },
          },
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
  changeColorScheme: protectedProcedure
    .input(
      z.object({
        colorScheme: colorSchemeParser,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: {
          id: ctx.session?.user?.id,
        },
        data: {
          settings: {
            update: {
              colorScheme: input.colorScheme,
            },
          },
        },
      });
    }),
  changeLanguage: protectedProcedure
    .input(
      z.object({
        language: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: {
          id: ctx.session?.user?.id,
        },
        data: {
          settings: {
            update: {
              language: input.language,
            },
          },
        },
      });
    }),
  getWithSettings: protectedProcedure.query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session?.user?.id,
      },
      include: {
        settings: true,
      },
    });

    if (!user || !user.settings) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      name: user.name,
      settings: user.settings,
    };
  }),

  updateSettings: protectedProcedure
    .input(updateSettingsValidationSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          settings: {
            update: {
              disablePingPulse: input.disablePingPulse,
              replacePingWithIcons: input.replaceDotsWithIcons,
              language: input.language,
            },
          },
        },
      });
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const cursor = input.cursor;
      const users = await ctx.prisma.user.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      return {
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        })),
        nextCursor,
      };
    }),
  createUser: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string().email().optional(),
        password: z.string().min(8).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = hashPassword(input.password, salt);
      await ctx.prisma.user.create({
        data: {
          name: input.username,
          email: input.email,
          password: hashedPassword,
          salt: salt,
          settings: {
            create: {},
          },
        },
      });
    }),

  deleteUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.delete({
        where: {
          id: input.userId,
        },
      });
    }),
});
