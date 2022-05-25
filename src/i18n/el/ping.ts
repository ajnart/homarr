import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  // Parse req.body as a ServiceItem
  const {
    url
  } = req.query;
  await axios.get((url as string)).then(response => {
    res.status(200).json(response.data);
  }).catch(error => {
    res.status(500).json(error);
  }); // // Make a request to the URL
  // const response = await axios.get(url);
  // // Return the response
}

export default (async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the reuqest is a POST or a GET
  if (req.method === 'GET') {
    return Get(req, res);
  }

  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed'
  });
});