import mempoolJS from '@mempool/mempool.js';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../../trpc';

const apiHostname = 'mempool.space'
const btcPriceSchema = z.object({
  time: z.number(),
  USD: z.number(),
  EUR: z.number(),
  GBP: z.number(),
  CAD: z.number(),
  CHF: z.number(),
  AUD: z.number(),
  JPY: z.number(),
});


const recommendedFeesSchema = z.object({
  fastestFee: z.number(),
  halfHourFee: z.number(),
  hourFee: z.number(),
  minimumFee: z.number(),
});

const initialDataSchema = z.object({
  price: btcPriceSchema,
  recommendedFees: recommendedFeesSchema,
});

export const bitcoinRouter = createTRPCRouter({
  getBTCPrice: publicProcedure.output(btcPriceSchema).query(async () => fetchPrice()),
  getRecommendedFees: publicProcedure
    .output(recommendedFeesSchema)
    .query(async () => getRecommendedFees()),
  getInitialData: publicProcedure
    .output(initialDataSchema)
    .query(async () => getInitialData()),
});

export type BtcPrice = z.infer<typeof btcPriceSchema>;
export type RecommendedFees = z.infer<typeof recommendedFeesSchema>;

export const getRecommendedFees = async () => {
  const {
    bitcoin: { fees },
  } = mempoolJS({
    hostname: apiHostname,
  });
  return recommendedFeesSchema.parse(await fees.getFeesRecommended());
};


export const fetchPrice = async () => {
  const res = await fetch(`https://mempool.space/api/v1/prices`);
  return btcPriceSchema.parse(await res.json());
};

export const getInitialData = async () => {
  const price = await fetchPrice();
  const recommendedFees = await getRecommendedFees();
  return {
    price: btcPriceSchema.parse(price),
    recommendedFees: recommendedFeesSchema.parse(recommendedFees),
  };
};
