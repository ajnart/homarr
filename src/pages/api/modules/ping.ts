import axios from 'axios';
import https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  // Parse req.body as a ServiceItem
  const { url } = req.query;
  const agent = new https.Agent({ rejectUnauthorized: false });
  await axios
    .get(url as string, { httpsAgent: agent })
    .then((response) => {
      res.status(response.status).json(response.statusText);
    })
    .catch((error) => {
      if (error.response) {
        res.status(error.response.status).json(error.response.statusText);
      } else {
        res.status(500).json('Server Error');
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
