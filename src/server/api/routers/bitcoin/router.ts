import { z } from 'zod';

import { adminProcedure, createTRPCRouter, publicProcedure } from '../../trpc';

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

export const bitcoinRouter = createTRPCRouter({
  getBTCPrice: publicProcedure.output(btcPriceSchema).query(async () => fetchPrice()),
});

export type BtcPrice = z.infer<typeof btcPriceSchema>;

export const fetchPrice = async () => {
  const res = await fetch(`https://mempool.space/api/v1/prices`);
  return btcPriceSchema.parse(await res.json());
};
