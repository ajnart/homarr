import Consola from 'consola';
import { NextApiRequest, NextApiResponse } from 'next';

function Post(req: NextApiRequest, res: NextApiResponse) {
  const { tried } = req.body;
  // Try to match the password with the EDIT_PASSWORD env variable
  if (tried === process.env.EDIT_MODE_PASSWORD) {
    process.env.DISABLE_EDIT_MODE = process.env.DISABLE_EDIT_MODE === 'true' ? 'false' : 'true';
    return res.status(200).json({
      success: true,
    });
  }
  // Warn that there was a wrong password attempt (date : wrong password, person's IP)
  Consola.warn(
    `${new Date().toLocaleString()} : Wrong edit password attempt, from ${
      req.headers['x-forwarded-for']
    }`
  );
  return res.status(200).json({
    success: false,
  });
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the request is a POST or a GET
  if (req.method === 'POST') {
    return Post(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
