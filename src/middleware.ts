import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line consistent-return
export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const isCorrectPassword = req.cookies.get('password') === process.env.PASSWORD;
  const url = req.nextUrl.clone();
  const skipURL =
    url.pathname &&
    (url.pathname.includes('login') ||
      url.pathname === '/api/configs/tryPassword' ||
      (url.pathname.includes('/_next/') && !url.pathname.includes('/pages/')) ||
      url.pathname === '/favicon.ico' ||
      url.pathname === '/404' ||
      url.pathname.includes('pages/_app'));
  if (!skipURL && !isCorrectPassword && process.env.PASSWORD) {
    url.pathname = '/login';
    return NextResponse.rewrite(url);
  }
}
