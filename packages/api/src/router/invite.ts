import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { createId } from "@homarr/common";
import { asc, eq } from "@homarr/db";
import { invites } from "@homarr/db/schema";
import { selectInviteSchema } from "@homarr/db/validationSchemas";

import { createTRPCRouter, permissionRequiredProcedure } from "../trpc";
import { throwIfCredentialsDisabled } from "./invite/checks";

export const inviteRouter = createTRPCRouter({
  getAll: permissionRequiredProcedure
    .requiresPermission("admin")
    .output(
      z.array(
        selectInviteSchema
          .pick({
            id: true,
            expirationDate: true,
          })
          .extend({ creator: z.object({ name: z.string().nullable(), id: z.string() }) }),
      ),
    )
    .input(z.undefined())
    .meta({ openapi: { method: "GET", path: "/api/invites", tags: ["invites"], protect: true } })
    .query(async ({ ctx }) => {
      throwIfCredentialsDisabled();
      return await ctx.db.query.invites.findMany({
        orderBy: asc(invites.expirationDate),
        columns: {
          token: false,
        },
        with: {
          creator: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),
  createInvite: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(
      z.object({
        expirationDate: z.date(),
      }),
    )
    .output(z.object({ id: z.string(), token: z.string() }))
    .meta({ openapi: { method: "POST", path: "/api/invites", tags: ["invites"], protect: true } })
    .mutation(async ({ ctx, input }) => {
      throwIfCredentialsDisabled();
      const id = createId();
      const token = randomBytes(20).toString("hex");

      await ctx.db.insert(invites).values({
        id,
        expirationDate: input.expirationDate,
        creatorId: ctx.session.user.id,
        token,
      });

      return {
        id,
        token,
      };
    }),
  deleteInvite: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(z.undefined())
    .meta({ openapi: { method: "DELETE", path: "/api/invites/{id}", tags: ["invites"], protect: true } })
    .mutation(async ({ ctx, input }) => {
      throwIfCredentialsDisabled();
      const dbInvite = await ctx.db.query.invites.findFirst({
        where: eq(invites.id, input.id),
      });

      if (!dbInvite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      await ctx.db.delete(invites).where(eq(invites.id, input.id));
    }),
});
