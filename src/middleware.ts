import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const ok = req.cookies.get('password') === process.env.PASSWORD;
  const url = req.nextUrl.clone();
  if (
    !ok &&
    url.pathname !== '/login' &&
    process.env.PASSWORD &&
    url.pathname !== '/api/configs/tryPassword'
  ) {
    url.pathname = '/login';
  }
  return NextResponse.rewrite(url);
}
