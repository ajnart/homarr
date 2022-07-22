import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// eslint-disable-next-line consistent-return
export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('password');
  const isPasswordCorrect = cookie === process.env.PASSWORD;
  if (
    !isPasswordCorrect &&
    request.nextUrl.pathname !== '/login' &&
    request.nextUrl.pathname !== '/api/configs/trylogin'
  ) {
    return NextResponse.rewrite(new URL('/login', request.url));
  }
}
