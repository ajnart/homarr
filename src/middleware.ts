import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line consistent-return
export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { cookies } = req;
  const passwordCookie = cookies.get('password')?.value;
  const isCorrectPassword = passwordCookie?.toString() === process.env.PASSWORD;
  const url = req.nextUrl.clone();
  // Skip the middleware if the URL is 'login', 'api/configs/tryPassword', '_next/*', 'favicon.ico', '404', 'migrate' or 'pages/_app'
  const skippedUrls = [
    '/login',
    '/api/configs/tryPassword',
    '/_next/',
    '/favicon.ico',
    '/404',
    '/migrate',
    '/pages/_app',
  ];
  if (skippedUrls.some((skippedUrl) => url.pathname.startsWith(skippedUrl))) {
    return NextResponse.next();
  }
  // If the password is not correct, redirect to the login page
  if (!isCorrectPassword && process.env.PASSWORD) {
    url.pathname = '/login';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}
