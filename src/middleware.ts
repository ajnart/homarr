import Consola from 'consola';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';

import { getUrl } from './tools/server/url';
import { client } from './utils/api';

const skippedUrls = [
  '/onboard',
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/404',
  '/pages/_app',
  '/auth/login',
  '/imgs/',
];

let cachedUserCount = 0;

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Do not redirect if the url is in the skippedUrls array
  if (skippedUrls.some((skippedUrl) => url.pathname.startsWith(skippedUrl))) {
    return NextResponse.next();
  }

  // Do not redirect if we are on Vercel
  if (env.VERCEL) {
    return NextResponse.next();
  }

  // Do not redirect if there are users in the database
  if (cachedUserCount > 0 || !(await shouldRedirectToOnboard())) {
    // redirect to login if not logged in
    // not working, should work in next-auth 5
    // @see https://github.com/nextauthjs/next-auth/pull/7443

    // const session = await getServerSession();
    // if (!session?.user) {
    //   return NextResponse.redirect(getUrl(req) + '/auth/login')
    // }
    return NextResponse.next();
  }

  return NextResponse.redirect(getUrl(req) + '/onboard');
}

const shouldRedirectToOnboard = async (): Promise<boolean> => {
  const cacheAndGetUserCount = async () => {
    cachedUserCount = await client.user.count.query();
    return cachedUserCount === 0;
  };

  if (!env.DATABASE_URL?.startsWith('file:')) {
    return await cacheAndGetUserCount();
  }

  const fileUri = env.DATABASE_URL.substring(4);
  try {
    await fs.access(fileUri, fs.constants.W_OK);
    return await cacheAndGetUserCount();
  } catch {
    Consola.warn(
      `detected that the path ${fileUri} was not readable. Showing onboarding page for setup...`
    );
    return true;
  }
};
