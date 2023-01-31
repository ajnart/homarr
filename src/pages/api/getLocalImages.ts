import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

function Get(req: NextApiRequest, res: NextApiResponse) {
  // Get the name of all the files in the /public/icons folder handle if the folder doesn't exist
  if (!fs.existsSync('./public/icons')) {
    return res.status(200).json({
      files: [],
    });
  }
  const files = fs.readdirSync('./public/icons');
  // Return the list of files with the /public/icons prefix
  return res.status(200).json({
    files: files.map((file) => `/icons/${file}`),
  });
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
