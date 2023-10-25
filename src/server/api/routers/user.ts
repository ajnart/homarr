import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { eq, like, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/server/db';
import { getTotalUserCountAsync } from '~/server/db/queries/user';
import { UserSettings, invites, userSettings, users } from '~/server/db/schema';
import { hashPassword } from '~/utils/security';
import {
  colorSchemeParser,
  createNewUserSchema,
  signUpFormSchema,
  updateSettingsValidationSchema,
} from '~/validations/user';

import { COOKIE_COLOR_SCHEME_KEY, COOKIE_LOCALE_KEY } from '../../../../data/constants';
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

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
  count: publicProcedure.query(async () => {
    return await getTotalUserCountAsync();
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
      })
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
      })
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
        search: z
          .string()
          .optional()
          .transform((value) => (value === '' ? undefined : value)),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      const dbUsers = await db.query.users.findMany({
        limit: limit + 1,
        offset: limit * input.page,
        where: input.search ? like(users.name, `%${input.search}%`) : undefined,
      });

      const countUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(input.search ? like(users.name, `%${input.search}%`) : undefined)
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
      };
    }),
  create: adminProcedure.input(createNewUserSchema).mutation(async ({ ctx, input }) => {
    await createUserIfNotPresent(input);
  }),

  deleteUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
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
  } | void
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
