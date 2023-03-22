import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { cookies } = req;

  // Don't even bother with the middleware if there is no defined password
  if (!process.env.PASSWORD) return NextResponse.next();

  const url = req.nextUrl.clone();
  const passwordCookie = cookies.get('password')?.value;

  const isCorrectPassword = passwordCookie?.toString() === process.env.PASSWORD;
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
