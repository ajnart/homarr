import { z } from "zod/v4";

import { createSaltAsync, hashPasswordAsync } from "@homarr/auth";
import { createId } from "@homarr/common";
import { generateSecureRandomToken } from "@homarr/common/server";
import { db, eq } from "@homarr/db";
import { apiKeys } from "@homarr/db/schema";

import { createTRPCRouter, permissionRequiredProcedure } from "../trpc";

export const apiKeysRouter = createTRPCRouter({
  getAll: permissionRequiredProcedure.requiresPermission("admin").query(() => {
    return db.query.apiKeys.findMany({
      columns: {
        id: true,
        apiKey: false,
        salt: false,
      },
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });
  }),
  create: permissionRequiredProcedure.requiresPermission("admin").mutation(async ({ ctx }) => {
    const salt = await createSaltAsync();
    const randomToken = generateSecureRandomToken(64);
    const hashedRandomToken = await hashPasswordAsync(randomToken, salt);
    const id = createId();
    await db.insert(apiKeys).values({
      id,
      apiKey: hashedRandomToken,
      salt,
      userId: ctx.session.user.id,
    });
    return {
      apiKey: `${id}.${randomToken}`,
    };
  }),
  delete: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(z.object({ apiKeyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(apiKeys).where(eq(apiKeys.id, input.apiKeyId)).limit(1);
    }),
});
