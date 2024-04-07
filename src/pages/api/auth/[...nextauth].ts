import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import { constructAuthOptions } from '~/server/auth';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, await constructAuthOptions(req, res));
}
