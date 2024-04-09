import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../../trpc';
import { cryptoDataSchema, cryptoMarketChartSchema, cryptoWidgetDataSchema } from './types';
import { getCoinGeckoCryptoData, getCoinGeckoCryptoMarketChart, getInitialData } from './api';


export const cryptoCurrenciesRouter = createTRPCRouter({
  getCoinGeckoCryptoData: publicProcedure
    .output(cryptoDataSchema)
    .input(z.string().optional())
    .query(async ({ input }) => getCoinGeckoCryptoData(input)),
  getCoinGeckoCryptoMarketChart: publicProcedure
    .output(cryptoMarketChartSchema)
    .input(
      z.object({
        crypto: z.string().optional(),
        fiatCurrency: z.string().optional(),
        days: z.number().optional(),
      })
    )
    .query(async ({ input }) => getCoinGeckoCryptoMarketChart(input)),

  getInitialData: publicProcedure
    .output(cryptoWidgetDataSchema)
    .query(async () => getInitialData()),
});




