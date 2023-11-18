import { NextRequest, NextResponse } from 'next/server';

import { getUrl } from './tools/server/url';
import { client } from './utils/api';

const skippedUrls = [
  '/onboard',
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/404',
  '/pages/_app',
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
  if (process.env.VERCEL) {
    return NextResponse.next();
  }

  // Do not redirect if there are users in the database
  if (cachedUserCount > 0) {
    return NextResponse.next();
  }

  // Do not redirect if there are users in the database
  if (!(await shouldRedirectToOnboard())) {
    return NextResponse.next();
  }

  return NextResponse.redirect(getUrl(req) + '/onboard');
}

const shouldRedirectToOnboard = async (): Promise<boolean> => {
  const cacheAndGetUserCount = async () => {
    cachedUserCount = await client.user.count.query();
    return cachedUserCount === 0;
  };

  return await cacheAndGetUserCount();
};
