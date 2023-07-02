import { TRPCError } from '@trpc/server';
import axios from 'axios';
import Consola from 'consola';
import cookie, { CookieSerializeOptions } from 'cookie';
import { getCookie } from 'cookies-next';
import { cookies } from 'next/headers';
import { env } from 'process';
import { z } from 'zod';
import { getConfig } from '~/tools/config/getConfig';

import { createTRPCRouter, publicProcedure } from '../trpc';

export function setCookie(
  resHeaders: Headers,
  name: string,
  value: string,
  options?: CookieSerializeOptions
) {
  resHeaders.append('Set-Cookie', cookie.serialize(name, value, options));
}

export const systemRouter = createTRPCRouter({
  tryPassword: publicProcedure
    .input(
      z.object({
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (process.env.INTEGRATIONS_PASSWORD !== input.password) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        });
      }
    }),

  checkLogin: publicProcedure
    .input(
      z.object({
        password: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      if (!input.password) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        });
      }
      const configName = getCookie('configName');
      const config = getConfig(configName?.toString() ?? 'default');
      if (process.env.INTEGRATIONS_PASSWORD !== input.password) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        });
      }
      return config.integrations;
    }),
});
