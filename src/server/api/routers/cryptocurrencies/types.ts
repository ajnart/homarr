import { z } from "zod";

export const cryptoDataSchema = z.object({
    id: z.string().optional(),
    symbol: z.string(),
    name: z.string(),
    links: z.object({
      whitepaper: z.string().optional(),
      twitter_screen_name: z.string().optional(),
      facebook_username: z.string().optional(),
      subreddit_url: z.string().optional(),
    }),
    image: z.object({
      thumb: z.string().optional(),
      small: z.string().optional(),
      large: z.string().optional(),
    }),
    market_cap_rank: z.number(),
    market_data: z.object({
      current_price: z.object({
        usd: z.number(),
        eur: z.number(),
      }),
      ath: z.object({}),
      atl: z.object({}),
      total_volume: z.object({}),
      price_change_percentage_24h: z.number(),
      price_change_percentage_7d: z.number(),
      price_change_percentage_30d: z.number(),
    }),
  });
  export const cryptoMarketChartSchema = z.object({
    prices: z.array(
      z.array(
        z.object({
          0: z.date(),
          1: z.number(),
        })
      )
    ),
    marketCaps: z.array(
      z.object({
        0: z.date(),
        1: z.number(),
      })
    ),
    totalVolume: z.array(
      z.object({
        0: z.date(),
        1: z.number(),
      })
    ),
  });
  export const cryptoWidgetDataSchema = z.object({
    cryptoData: z.object({
      cryptoPrice: cryptoDataSchema,
    }),
    marketData: z.object({
      cryptoMarketData: cryptoMarketChartSchema,
    }),
  });
  export type CryptoPrice = z.infer<typeof cryptoDataSchema>;
export type CryptoMarketData = z.infer<typeof cryptoMarketChartSchema>;
export type cryptoWidgetData = z.infer<typeof cryptoMarketChartSchema>;