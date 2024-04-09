import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../../trpc';

const cryptoPriceSchema = z.object({
  id: z.number().optional(),
  symbol: z.string(),
  name: z.string(),
  links: z.object({
    homepage: z.string().optional(),
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
    current_price: z.array(z.object({})),
    ath: z.array(z.object({})),
    atl: z.array(z.object({})),
    total_volume: z.array(z.object({})),
    price_change_percentage_24h: z.number(),
    price_change_percentage_7d: z.number(),
    price_change_percentage_30d: z.number(),
  }),
});

const cryptoMarketChart = z.object({
  prices: z.array(
    z.object({
      0: z.number().optional(),
      1: z.number(),
    })
  ),
  marketCaps: z.array(
    z.object({
      0: z.date().optional(),
      1: z.number(),
    })
  ),
  totalVolume: z.array(
    z.object({
      0: z.date().optional(),
      1: z.number(),
    })
  ),
});

export const bitcoinRouter = createTRPCRouter({
  getBTCPrice: publicProcedure.output(btcPriceSchema).query(async () => fetchPrice()),
  getRecommendedFees: publicProcedure
    .output(recommendedFeesSchema)
    .query(async () => getRecommendedFees()),
  getInitialData: publicProcedure.output(initialDataSchema).query(async () => getInitialData()),
});

export type CryptoPrice = z.infer<typeof cryptoPriceSchema>;

export const getCoinGeckoCryptoData = async (crypto = 'bitcoin') => {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto}`);
  return cryptoPriceSchema.parse(await res.json());
};
export const getCoinGeckoCryptoMarketChart = async (
  fiatCurrency = "usd",
  days = 7
) => {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${fiatCurrency}&days=${days}`
  );
  return cryptoPriceSchema.parse(await res.json());
};
export const getInitialData = async () => {
  const cryptoData = await getCoinGeckoCryptoData();
  const marketData = await getCoinGeckoCryptoMarketChart();
  return {
    cryptoData,
    marketData
  };
};
