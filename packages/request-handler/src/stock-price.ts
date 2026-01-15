import dayjs from "dayjs";
import { z } from "zod/v4";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { withTimeoutAsync } from "@homarr/core/infrastructure/http/timeout";

import { createCachedWidgetRequestHandler } from "./lib/cached-widget-request-handler";

export const fetchStockPriceHandler = createCachedWidgetRequestHandler({
  queryKey: "fetchStockPriceResult",
  widgetKind: "stockPrice",
  async requestAsync(input: { stock: string; timeRange: string; timeInterval: string }) {
    const response = await withTimeoutAsync(async (signal) => {
      return await fetchWithTrustedCertificatesAsync(
        `https://query1.finance.yahoo.com/v8/finance/chart/${input.stock}?range=${input.timeRange}&interval=${input.timeInterval}`,
        { signal },
      );
    });
    const data = dataSchema.parse(await response.json());

    if ("error" in data) {
      throw new Error(data.error.description);
    }
    if (data.chart.result.length !== 1) {
      throw new Error("Received multiple results");
    }
    const firstResult = data.chart.result[0];
    if (!firstResult) {
      throw new Error("Received invalid data");
    }

    const priceHistory =
      firstResult.indicators.quote[0]?.close.filter(
        // Filter out null values from price arrays (Yahoo Finance returns null for missing data points)
        (value) => value !== null && value !== undefined,
      ) ?? [];

    return {
      priceHistory,
      previousClose: firstResult.meta.previousClose ?? priceHistory[0] ?? 1,
      symbol: firstResult.meta.symbol,
      shortName: firstResult.meta.shortName,
    };
  },
  cacheDuration: dayjs.duration(5, "minutes"),
});

const dataSchema = z
  .object({
    error: z.object({
      description: z.string(),
    }),
  })
  .or(
    z.object({
      chart: z.object({
        result: z.array(
          z.object({
            indicators: z.object({
              quote: z.array(
                z.object({
                  close: z.array(z.number().nullish()),
                }),
              ),
            }),
            meta: z.object({
              symbol: z.string(),
              shortName: z.string(),
              previousClose: z.number().optional(),
            }),
          }),
        ),
      }),
    }),
  );
