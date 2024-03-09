import { z } from 'zod';

import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc';

const citySchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  population: z.number().optional(),
});

const weatherSchema = z.object({
  current_weather: z.object({
    weathercode: z.number(),
    temperature: z.number(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    weathercode: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
  }),
});

export const weatherRouter = createTRPCRouter({
  findCity: adminProcedure
    .input(
      z.object({
        query: z.string().min(2),
      })
    )
    .output(
      z.object({
        results: z.array(citySchema),
      })
    )
    .query(async ({ input }) => fetchCity(input.query)),
  at: publicProcedure
    .input(
      z.object({
        longitude: z.number(),
        latitude: z.number(),
      })
    )
    .output(weatherSchema)
    .query(async ({ input }) => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${input.latitude}&longitude=${input.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Europe%2FLondon`
      );
      return res.json();
    }),
});

export type City = z.infer<typeof citySchema>;
export type Weather = z.infer<typeof weatherSchema>;

const outputSchema = z.object({
  results: z.array(citySchema),
});

export const fetchCity = async (query: string) => {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}`);
  return outputSchema.parse(await res.json());
};
