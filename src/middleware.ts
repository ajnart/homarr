import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';
import { v4 } from 'uuid';

import { COOKIE_DEVICE_ID_KEY } from '../data/constants';
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
  const deviceId = req.cookies.get(COOKIE_DEVICE_ID_KEY)?.value ?? null;

  // Do not redirect if the url is in the skippedUrls array
  if (skippedUrls.some((skippedUrl) => url.pathname.startsWith(skippedUrl))) {
    return HomarrResponse.next(deviceId);
  }

  // Do not redirect if we are on Vercel
  if (env.VERCEL) {
    return HomarrResponse.next(deviceId);
  }

  // Do not redirect if there are users in the database
  if (cachedUserCount > 0) {
    return HomarrResponse.next(deviceId);
  }

  // is only called from when there were no users in the database in this session (Since the app started)
  cachedUserCount = await client.user.count.query();

  // Do not redirect if there are users in the database
  if (cachedUserCount > 0) {
    return HomarrResponse.next(deviceId);
  }

  return NextResponse.redirect(getUrl(req) + '/onboard');
}

const addDeviceIdToResponse = (response: NextResponse) => {
  response.cookies.set(COOKIE_DEVICE_ID_KEY, v4(), {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10), // 10 years
  });
};

const HomarrResponse = {
  next: (deviceId: string | null) => {
    const response = NextResponse.next();
    if (!deviceId) {
      addDeviceIdToResponse(response);
    }
    return response;
  },
};
