import { z } from "zod/v4";

import { fetchStockPriceHandler } from "@homarr/request-handler/stock-price";

import { stockPriceTimeFrames } from "../../../../widgets/src/stocks";
import { createTRPCRouter, publicProcedure } from "../../trpc";

const stockPriceInputSchema = z.object({
  stock: z.string().nonempty(),
  timeRange: z.enum(stockPriceTimeFrames.range),
  timeInterval: z.enum(stockPriceTimeFrames.interval),
});

export const stockPriceRouter = createTRPCRouter({
  getPriceHistory: publicProcedure.input(stockPriceInputSchema).query(async ({ input }) => {
    const innerHandler = fetchStockPriceHandler.handler({
      stock: input.stock,
      timeRange: input.timeRange,
      timeInterval: input.timeInterval,
    });
    return await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: false });
  }),
});
