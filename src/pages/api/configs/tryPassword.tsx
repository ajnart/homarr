import Consola from 'consola';
import { NextApiRequest, NextApiResponse } from 'next';

function Post(req: NextApiRequest, res: NextApiResponse) {
  const { tried, type = 'password' } = req.body;
  // If the type of password is "edit", we run this branch to check the edit password
  if (type === 'edit') {
    if ((tried === process.env.EDIT_MODE_PASSWORD) !== undefined) {
      if (process.env.DISABLE_EDIT_MODE?.toLowerCase() === 'true') {
        process.env.DISABLE_EDIT_MODE = 'false';
      } else {
        process.env.DISABLE_EDIT_MODE = 'true';
      }
      return res.status(200).json({
        success: true,
      });
    }
  } else if (tried === process.env.PASSWORD) {
    return res.status(200).json({
      success: true,
    });
  }
  Consola.warn(
    `${new Date().toLocaleString()} : Wrong password attempt, from ${
      req.headers['x-forwarded-for']
    }`
  );
  return res.status(401).json({
    success: false,
  });
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return Post(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
