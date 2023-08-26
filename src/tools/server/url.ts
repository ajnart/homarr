import { NextRequest } from 'next/server';

export const getUrl = (req: NextRequest) => {
  const protocol = req.nextUrl.protocol;
  return protocol + '//' + req.headers.get('host');
};
