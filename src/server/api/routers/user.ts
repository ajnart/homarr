import { TRPCError } from '@trpc/server';

import bcrypt from 'bcrypt';

import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { COOKIE_COLOR_SCHEME_KEY, COOKIE_LOCALE_KEY } from '../../../../data/constants';

import { hashPassword } from '~/utils/security';
import {
  colorSchemeParser,
  createNewUserSchema,
  signUpFormSchema,
  updateSettingsValidationSchema,
} from '~/validations/user';

export const userRouter = createTRPCRouter({
  createFromInvite: publicProcedure
    .input(
      signUpFormSchema.and(
        z.object({
          inviteToken: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const token = await ctx.prisma.invite.findUnique({
        where: {
          token: input.inviteToken,
        },
      });

      if (!token || token.expires < new Date()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid invite token',
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
      await ctx.prisma.invite.delete({
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
  withSettings: protectedProcedure.query(async ({ ctx, input }) => {
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
              defaultBoard: input.defaultBoard,
              language: input.language
            },
          },
        },
      });
    }),

  all: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(0),
        search: z
          .string()
          .optional()
          .transform((value) => (value === '' ? undefined : value)),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      const users = await ctx.prisma.user.findMany({
        take: limit + 1,
        skip: limit * input.page,
        where: {
          name: {
            contains: input.search,
          },
        },
      });

      const countUsers = await ctx.prisma.user.count({
        where: {
          name: {
            contains: input.search,
          },
        },
      });

      return {
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        })),
        countPages: Math.ceil(countUsers / limit),
      };
    }),
  create: publicProcedure.input(createNewUserSchema).mutation(async ({ ctx, input }) => {
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
