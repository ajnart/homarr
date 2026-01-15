import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, eq } from "@homarr/db";
import { sectionCollapseStates, sections } from "@homarr/db/schema";

import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const sectionRouter = createTRPCRouter({
  changeCollapsed: protectedProcedure
    .input(
      z.object({
        sectionId: z.string(),
        collapsed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.db.query.sections.findFirst({
        where: and(eq(sections.id, input.sectionId), eq(sections.kind, "category")),
        with: {
          collapseStates: {
            where: eq(sectionCollapseStates.userId, ctx.session.user.id),
          },
        },
      });

      if (!section) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Section not found id=${input.sectionId}`,
        });
      }

      if (section.collapseStates.length === 0) {
        await ctx.db.insert(sectionCollapseStates).values({
          sectionId: section.id,
          userId: ctx.session.user.id,
          collapsed: input.collapsed,
        });
        return;
      }

      await ctx.db
        .update(sectionCollapseStates)
        .set({
          collapsed: input.collapsed,
        })
        .where(
          and(eq(sectionCollapseStates.sectionId, section.id), eq(sectionCollapseStates.userId, ctx.session.user.id)),
        );
    }),
});
