import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

function Put(req: NextApiRequest, res: NextApiResponse) {
  // Get the slug of the request
  const { slug } = req.query as { slug: string };
  // Get the body of the request
  const { body }: { body: string } = req;
  if (!slug || !body) {
    res.status(400).json({
      error: 'Wrong request',
    });
  }
  // Save the body in the /data/config folder with the slug as filename

  fs.writeFileSync(
    path.join('data/configs', `${slug}.json`),
    JSON.stringify(body, null, 2),
    'utf8'
  );
  return res.status(200).json({
    message: 'Configuration saved with success',
  });
}

function Get(req: NextApiRequest, res: NextApiResponse) {
  // Get the slug of the request
  const { slug } = req.query as { slug: string };
  if (!slug) {
    return res.status(400).json({
      message: 'Wrong request',
    });
  }
  // Loop over all the files in the /data/configs directory
  const files = fs.readdirSync('data/configs');
  // Strip the .json extension from the file name
  const configs = files.map((file) => file.replace('.json', ''));
  // If the target is not in the list of files, return an error
  if (!configs.includes(slug)) {
    return res.status(404).json({
      message: 'Target not found',
    });
  }
  // Return the content of the file
  return res.status(200).json(fs.readFileSync(path.join('data/configs', `${slug}.json`), 'utf8'));
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the reuqest is a Put or a GET
  if (req.method === 'PUT') {
    return Put(req, res);
  }
  if (req.method === 'GET') {
    return Get(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
