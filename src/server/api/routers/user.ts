import { TRPCError } from '@trpc/server';

import bcrypt from 'bcryptjs';

import { randomUUID } from 'crypto';

import { and, eq, like, sql } from 'drizzle-orm';

import { z } from 'zod';

import { COOKIE_COLOR_SCHEME_KEY, COOKIE_LOCALE_KEY } from '../../../../data/constants';
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

import { db } from '~/server/db';
import { getTotalUserCountAsync } from '~/server/db/queries/user';
import { invites, sessions, users, userSettings, UserSettings } from '~/server/db/schema';
import { hashPassword } from '~/utils/security';
import {
  colorSchemeParser,
  createNewUserSchema,
  signUpFormSchema,
  updateSettingsValidationSchema,
} from '~/validations/user';
import { PossibleRoleFilter } from '~/pages/manage/users';

export const userRouter = createTRPCRouter({
  createOwnerAccount: publicProcedure.input(signUpFormSchema).mutation(async ({ ctx, input }) => {
    const userCount = await getTotalUserCountAsync();
    if (userCount > 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
      });
    }

    await createUserIfNotPresent(input, {
      defaultSettings: {
        colorScheme: colorSchemeParser.parse(ctx.cookies[COOKIE_COLOR_SCHEME_KEY]),
        language: ctx.cookies[COOKIE_LOCALE_KEY] ?? 'en',
      },
      isOwner: true,
    });
  }),
  updatePassword: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        newPassword: z.string().min(3),
        terminateExistingSessions: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }

      if (user.isOwner && user.id !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Operation not allowed or incorrect user',
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = hashPassword(input.newPassword, salt);

      if (input.terminateExistingSessions) {
        await db.delete(sessions).where(eq(sessions.userId, input.userId));
      }

      await db
        .update(users)
        .set({
          password: hashedPassword,
          salt: salt,
        })
        .where(eq(users.id, input.userId));
    }),
  count: publicProcedure.query(async () => {
    return await getTotalUserCountAsync();
  }),
  createFromInvite: publicProcedure
    .input(
      signUpFormSchema.and(
        z.object({
          inviteToken: z.string(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const invite = await db.query.invites.findFirst({
        where: eq(invites.token, input.inviteToken),
      });

      if (!invite || invite.expires < new Date()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid invite token',
        });
      }

      const userId = await createUserIfNotPresent(input, {
        defaultSettings: {
          colorScheme: colorSchemeParser.parse(ctx.cookies[COOKIE_COLOR_SCHEME_KEY]),
          language: ctx.cookies[COOKIE_LOCALE_KEY] ?? 'en',
        },
      });

      await db.delete(invites).where(eq(invites.id, invite.id));

      return {
        id: userId,
        name: input.username,
      };
    }),
  changeColorScheme: protectedProcedure
    .input(
      z.object({
        colorScheme: colorSchemeParser,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(userSettings)
        .set({
          colorScheme: input.colorScheme,
        })
        .where(eq(userSettings.userId, ctx.session?.user?.id));
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

      const user = await db.query.users.findFirst({
        where: eq(users.id, input.id),
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

      await db
        .update(users)
        .set({ isAdmin: input.type === 'promote' })
        .where(eq(users.id, input.id));
    }),
  changeLanguage: protectedProcedure
    .input(
      z.object({
        language: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(userSettings)
        .set({ language: input.language })
        .where(eq(userSettings.userId, ctx.session?.user?.id));
    }),
  withSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.session?.user?.id),
      with: {
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
      await db
        .update(userSettings)
        .set({
          autoFocusSearch: input.autoFocusSearch,
          defaultBoard: input.defaultBoard,
          disablePingPulse: input.disablePingPulse,
          firstDayOfWeek: input.firstDayOfWeek,
          language: input.language,
          openSearchInNewTab: input.openSearchInNewTab,
          replacePingWithIcons: input.replaceDotsWithIcons,
          searchTemplate: input.searchTemplate,
        })
        .where(eq(userSettings.userId, ctx.session?.user?.id));
    }),

  makeDefaultDashboard: protectedProcedure
    .input(z.object({ board: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(userSettings)
        .set({ defaultBoard: input.board })
        .where(eq(userSettings.userId, ctx.session?.user?.id));
    }),

  all: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(0),
        search: z.object({
          fullTextSearch: z
            .string()
            .optional()
            .transform((value) => (value === '' ? undefined : value)),
          role: z
            .string()
            .transform((value) => (value.length > 0 ? value : undefined))
            .optional(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {

      const roleFilter = () => {
        if (input.search.role === PossibleRoleFilter[1].id) {
          return eq(users.isOwner, true);
        }

        if (input.search.role === PossibleRoleFilter[2].id) {
          return eq(users.isAdmin, true);
        }

        if (input.search.role === PossibleRoleFilter[3].id) {
          return and(eq(users.isAdmin, false), eq(users.isOwner, false));
        }

        return undefined;
      };

      const limit = input.limit;
      const dbUsers = await db.query.users.findMany({
        limit: limit + 1,
        offset: limit * input.page,
        where: and(input.search.fullTextSearch ? like(users.name, `%${input.search.fullTextSearch}%`) : undefined, roleFilter()),
      });

      const countUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(input.search.fullTextSearch ? like(users.name, `%${input.search.fullTextSearch}%`) : undefined)
        .where(roleFilter())
        .then((rows) => rows[0].count);

      return {
        users: dbUsers.map((user) => ({
          id: user.id,
          name: user.name!,
          email: user.email,
          isAdmin: user.isAdmin,
          isOwner: user.isOwner,
        })),
        countPages: Math.ceil(countUsers / limit),
        stats: {
          roles: {
            all: (await db.select({ count: sql<number>`count(*)` }).from(users))[0]['count'],
            owner: (
              await db
                .select({ count: sql<number>`count(*)` })
                .from(users)
                .where(eq(users.isOwner, true))
            )[0]['count'],
            admin: (
              await db
                .select({ count: sql<number>`count(*)` })
                .from(users)
                .where(and(eq(users.isAdmin, true), eq(users.isOwner, false)))
            )[0]['count'],
            normal: (
              await db
                .select({ count: sql<number>`count(*)` })
                .from(users)
                .where(and(eq(users.isAdmin, false), eq(users.isOwner, false)))
            )[0]['count'],
          } as Record<string, number>,
        },
      };
    }),
  create: adminProcedure.input(createNewUserSchema).mutation(async ({ input }) => {
    await createUserIfNotPresent(input);
  }),
  details: adminProcedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
    return db.query.users.findFirst({
      where: eq(users.id, input.userId),
    });
  }),
  updateDetails: adminProcedure.input(z.object({
    userId: z.string(),
    username: z.string(),
    eMail: z.string().optional().transform(value => value?.length === 0 ? null : value),
  })).mutation(async ({ input }) => {
    await db.update(users).set({
      name: input.username,
      email: input.eMail as string | null,
    }).where(eq(users.id, input.userId));
  }),
  deleteUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.id),
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

      await db.delete(users).where(eq(users.id, input.id));
    }),
});

const createUserIfNotPresent = async (
  input: z.infer<typeof createNewUserSchema>,
  options: {
    defaultSettings?: Partial<UserSettings>;
    isOwner?: boolean;
  } | void,
) => {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.name, input.username),
  });

  if (existingUser) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'User already exists',
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = hashPassword(input.password, salt);
  const userId = randomUUID();
  await db.insert(users).values({
    id: userId,
    name: input.username,
    email: input.email,
    password: hashedPassword,
    salt: salt,
    isAdmin: options?.isOwner ?? false,
    isOwner: options?.isOwner ?? false,
  });

  await db.insert(userSettings).values({
    id: randomUUID(),
    userId,
    ...(options?.defaultSettings ?? {}),
  });

  return userId;
};
