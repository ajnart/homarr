import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line consistent-return
export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const isCorrectPassword = req.cookies.get('password') === process.env.PASSWORD;
  const url = req.nextUrl.clone();
  if (
    !isCorrectPassword &&
    url.pathname !== '/login' &&
    process.env.PASSWORD &&
    url.pathname !== '/api/configs/tryPassword'
  ) {
    url.pathname = '/login';
    return NextResponse.rewrite(url);
  }
}
