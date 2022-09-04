import { NextApiRequest, NextApiResponse } from 'next';
import DockerSingleton from '../DockerSingleton';

const docker = DockerSingleton.getInstance();

async function Get(req: NextApiRequest, res: NextApiResponse) {
  // Get the slug of the request
  const { id } = req.query as { id: string };
  const { action } = req.query;
  // Get the action on the request (start, stop, restart)
  if (action !== 'start' && action !== 'stop' && action !== 'restart' && action !== 'remove') {
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
  const startAction = async () => {
    switch (action) {
      case 'remove':
        return container.remove();
      case 'start':
        return container.start();
      case 'stop':
        return container.stop();
      case 'restart':
        return container.restart();
      default:
        return Promise;
    }
  };
  try {
    await startAction();
    return res.status(200).json({
      statusCode: 200,
      message: `Container ${id} ${action}ed`,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
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
