import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, eq } from "@homarr/db";
import { items } from "@homarr/db/schema";
import type { WidgetKind } from "@homarr/definitions";

import { publicProcedure } from "../trpc";

export const createOneItemMiddleware = (kind: WidgetKind) => {
  return publicProcedure.input(z.object({ itemId: z.string() })).use(async ({ input, ctx, next }) => {
    const item = await ctx.db.query.items.findFirst({
      where: and(eq(items.id, input.itemId), eq(items.kind, kind)),
    });

    if (!item) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Item with id ${input.itemId} not found`,
      });
    }

    return next({
      ctx: {
        item,
      },
    });
  });
};
