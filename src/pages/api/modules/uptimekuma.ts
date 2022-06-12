import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

async function Get(req: NextApiRequest, res: NextApiResponse) {
    const { url, dashboard } = req.query;
    const result = {
        incident: null,
        heartbeat: null,
    };
    let error = false;

    await axios
        .get(`${url}/api/status-page/${dashboard || 'default'}?cachebust=${Date.now()}`)
        .then((response) => {
            result.incident = response.data.incident;
        })
        .catch((e) => {
            console.error("Error : Can't get incidents", e);
            error = true;
        });

    await axios
        .get(`${url}/api/status-page/heartbeat/${dashboard || 'default'}?cachebust=${Date.now()}`)
        .then((response) => {
            result.heartbeat = response.data;
        })
        .catch((e) => {
            console.error("Error : Can't get heartbeat", e);
            error = true;
        });

    if (error) {
        res.status(500).json({ status: 'error' });
    } else {
    res.status(200).json({ status: 'ok', ...result });
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the reuqest is a POST or a GET
  if (req.method === 'GET') {
    return Get(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
