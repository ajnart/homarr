import { getServerSettingsAsync } from "@homarr/db/queries";

import type { WidgetOptionsSettings } from "../../../../widgets/src";
import { createTRPCRouter, publicProcedure } from "../../trpc";

export const optionsRouter = createTRPCRouter({
  getWidgetOptionSettings: publicProcedure.query(async ({ ctx }): Promise<WidgetOptionsSettings> => {
    const serverSettings = await getServerSettingsAsync(ctx.db);

    return {
      server: {
        board: {
          enableStatusByDefault: serverSettings.board.enableStatusByDefault,
          forceDisableStatus: serverSettings.board.forceDisableStatus,
        },
      },
    };
  }),
});
