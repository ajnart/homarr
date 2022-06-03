import { NextApiRequest, NextApiResponse } from 'next';
import si from 'systeminformation';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const [osInfo, cpuInfo, memInfo, cpuLoad] = await Promise.all([
    si.osInfo(),
    si.cpu(),
    si.mem(),
    si.currentLoad(),
  ]);

  const sysinfo = {
    cpu: cpuInfo,
    os: osInfo,
    mem: memInfo,
    load: cpuLoad,
  };
  res.status(200).json(sysinfo);
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
