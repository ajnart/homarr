import { UserSettings } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { hashPassword } from '~/utils/security';
import {
  colorSchemeParser,
  createNewUserSchema,
  signUpFormSchema,
  updateSettingsValidationSchema,
} from '~/validations/user';

import { COOKIE_COLOR_SCHEME_KEY, COOKIE_LOCALE_KEY } from '../../../../data/constants';
import {
  TRPCContext,
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../trpc';

export const userRouter = createTRPCRouter({
  createOwnerAccount: publicProcedure.input(signUpFormSchema).mutation(async ({ ctx, input }) => {
    const userCount = await ctx.prisma.user.count();
    if (userCount > 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
      });
    }

    await createUserIfNotPresent(ctx, input, {
      defaultSettings: {
        colorScheme: colorSchemeParser.parse(ctx.cookies[COOKIE_COLOR_SCHEME_KEY]),
        language: ctx.cookies[COOKIE_LOCALE_KEY] ?? 'en',
      },
      isOwner: true,
    });
  }),
  count: publicProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.user.count();
    return count;
  }),
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

      await createUserIfNotPresent(ctx, input, {
        defaultSettings: {
          colorScheme: colorSchemeParser.parse(ctx.cookies[COOKIE_COLOR_SCHEME_KEY]),
          language: ctx.cookies[COOKIE_LOCALE_KEY] ?? 'en',
        },
      });

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
  changeRole: adminProcedure
    .input(z.object({ id: z.string(), type: z.enum(['promote', 'demote']) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session?.user?.id === input.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot change your own role',
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (user.isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot change the role of the owner',
        });
      }

      await ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          isAdmin: input.type === 'promote',
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
      settings: {
        ...user.settings,
        firstDayOfWeek: z
          .enum(['monday', 'saturday', 'sunday'])
          .parse(user.settings.firstDayOfWeek),
      },
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
              language: input.language,
              firstDayOfWeek: input.firstDayOfWeek,
              searchTemplate: input.searchTemplate,
              openSearchInNewTab: input.openSearchInNewTab,
              autoFocusSearch: input.autoFocusSearch,
            },
          },
        },
      });
    }),

  makeDefaultDashboard: protectedProcedure
    .input(z.object({ board: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.userSettings.update({
        where: {
          userId: ctx.session?.user.id,
        },
        data: {
          defaultBoard: input.board,
        },
      });
    }),

  all: adminProcedure
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
          name: user.name!,
          email: user.email,
          isAdmin: user.isAdmin,
          isOwner: user.isOwner,
        })),
        countPages: Math.ceil(countUsers / limit),
      };
    }),
  create: adminProcedure.input(createNewUserSchema).mutation(async ({ ctx, input }) => {
    await createUserIfNotPresent(ctx, input);
  }),

  deleteUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (ctx.session?.user?.id === input.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot change your own role',
        });
      }
      if (user.isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot change the role of the owner',
        });
      }

      await ctx.prisma.user.delete({
        where: {
          id: input.id,
        },
      });
    }),
});

const createUserIfNotPresent = async (
  ctx: TRPCContext,
  input: z.infer<typeof createNewUserSchema>,
  options: {
    defaultSettings?: Partial<UserSettings>;
    isOwner?: boolean;
  } | void
) => {
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
  await ctx.prisma.user.create({
    data: {
      name: input.username,
      email: input.email,
      password: hashedPassword,
      salt: salt,
      isAdmin: options?.isOwner ?? false,
      isOwner: options?.isOwner ?? false,
      settings: {
        create: options?.defaultSettings ?? {},
      },
    },
  });
};
