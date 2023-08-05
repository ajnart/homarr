import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';

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
  if (env.VERCEL) {
    return NextResponse.next();
  }

  // Do not redirect if there are users in the database
  if (cachedUserCount > 0) {
    return NextResponse.next();
  }

  // is only called from when there were no users in the database in this session (Since the app started)
  cachedUserCount = await client.user.count.query();

  // Do not redirect if there are users in the database
  if (cachedUserCount > 0) {
    return NextResponse.next();
  }

  url.pathname = '/onboard';

  return NextResponse.redirect(url);
}
