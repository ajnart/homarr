import axios, { AxiosError } from 'axios';
import https from 'https';
import Consola from 'consola';
import { NextApiRequest, NextApiResponse } from 'next';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  // Parse req.body as a AppItem
  const { url } = req.query;
  const agent = new https.Agent({ rejectUnauthorized: false });
  await axios
    .get(url as string, { httpsAgent: agent, timeout: 2000 })
    .then((response) => {
      res.status(response.status).json(response.statusText);
    })
    .catch((error: AxiosError) => {
      if (error.response) {
        Consola.warn(`Unexpected response: ${error.message}`);
        res.status(error.response.status).json(error.response.statusText);
      } else if (error.code === 'ECONNABORTED') {
        res.status(408).json('Request Timeout');
      } else {
        Consola.error(`Unexpected error: ${error.message}`);
        res.status(500).json('Internal Server Error');
      }
    });
  // // Make a request to the URL
  // const response = await axios.get(url);
  // // Return the response
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
