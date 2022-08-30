import httpProxy from 'http-proxy';
import { NextApiRequest, NextApiResponse } from 'next';

const API_URL = 'http://localhost:3001';

const proxy = httpProxy.createProxyServer();
// Make sure that we don't parse JSON bodies on this route:
export const config = {
  api: {
    bodyParser: false,
  },
};
export default (req: NextApiRequest, res: NextApiResponse) => {
  proxy.web(req, res, { target: API_URL, changeOrigin: true });
};
