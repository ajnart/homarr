import { TRPCError } from "@trpc/server";
import SuperJSON from "superjson";
import { z } from "zod/v4";

import { eq } from "@homarr/db";
import { boards, items } from "@homarr/db/schema";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { throwIfActionForbiddenAsync } from "../board/board-access";

export const notebookRouter = createTRPCRouter({
  updateContent: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        content: z.string(),
        boardId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.boardId), "modify");

      const item = await ctx.db.query.items.findFirst({
        where: eq(items.id, input.itemId),
      });

      if (item?.boardId !== input.boardId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Specified item was not found",
        });
      }

      const options = SuperJSON.parse<{ content: string }>(item.options);
      options.content = input.content;
      await ctx.db
        .update(items)
        .set({ options: SuperJSON.stringify(options) })
        .where(eq(items.id, input.itemId));
    }),
});
