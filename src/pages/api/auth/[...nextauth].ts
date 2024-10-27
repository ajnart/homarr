import Consola from 'consola';
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import { constructAuthOptions } from '~/server/auth';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const sanitizedUrl = req.url?.split('?')[0];
  Consola.info(`Authentication endpoint called method=${req.method} url=${sanitizedUrl}`);
  return await NextAuth(req, res, await constructAuthOptions(req, res));
}
