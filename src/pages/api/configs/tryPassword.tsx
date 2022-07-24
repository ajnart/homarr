import { NextApiRequest, NextApiResponse } from 'next';

function Post(req: NextApiRequest, res: NextApiResponse) {
  const { tried } = req.body;
  // Try to match the password with the PASSWORD env variable
  if (tried === process.env.PASSWORD) {
    return res.status(200).json({
      success: true,
    });
  }
  return res.status(200).json({
    success: false,
  });
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the reuqest is a POST or a GET
  if (req.method === 'POST') {
    return Post(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
