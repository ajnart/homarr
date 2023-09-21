import { adminProcedure, createTRPCRouter } from '../../trpc';

export const globalSettingsRouter = createTRPCRouter({
  findSingleSetting: adminProcedure.query(async ({ ctx }) => {
    if (await ctx.prisma.globalSettings.count() === 0) {
      await ctx.prisma.globalSettings.create({
        data: {
          allowBoardCreation: true
        }
      });
    }
    return await ctx.prisma.globalSettings.findUniqueOrThrow();
  }),
});
