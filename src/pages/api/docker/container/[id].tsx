import { NextApiRequest, NextApiResponse } from 'next';
import Docker from 'dockerode';

const docker = new Docker();

async function Get(req: NextApiRequest, res: NextApiResponse) {
  // Get the slug of the request
  const { id } = req.query as { id: string };
  const { action } = req.query;
  // Get the action on the request (start, stop, restart)
  if (action !== 'start' && action !== 'stop' && action !== 'restart') {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid action',
    });
  }
  if (!id) {
    return res.status(400).json({
      message: 'Missing ID',
    });
  }
  // Get the container with the ID
  const container = docker.getContainer(id);
  // Get the container info
  container.inspect((err, data) => {
    if (err) {
      res.status(500).json({
        message: err,
      });
    }
  });

  switch (action) {
    case 'start':
      container.start((err, data) => {
        if (err) {
          res.status(500).json({
            message: err,
          });
        }
      });
      break;
    case 'stop':
      container.stop((err, data) => {
        if (err) {
          res.status(500).json({
            message: err,
          });
        }
      });
      break;
    case 'restart':
      container.restart((err, data) => {
        if (err) {
          res.status(500).json({
            message: err,
          });
        }
      });
      break;
    default:
      res.status(400).json({
        message: 'Invalid action',
      });
  }
  return res.status(200).json({
    success: true,
  });
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the reuqest is a Put or a GET
  if (req.method === 'GET') {
    return Get(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
