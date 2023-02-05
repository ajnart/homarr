import { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '../../../server/common/get-server-auth-session';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession({ req, res });
  const user = await prisma?.user.findFirst({
    where: { id: session?.user?.id },
  });

  if (!user?.isAdmin) {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'User does not have enough privileges.',
    });
  }

  const users = await prisma?.user.findMany();

  // !!! NEVER ADD THE PASSWORD TO THE RESPONSE !!!
  res.status(200).json(
    users?.map((user) => ({
      id: user.id,
      username: user.username,
      role: user.isAdmin ? 'admin' : 'user',
      isEnabled: user.isEnabled,
      lastActiveAt: user.lastActiveAt,
    }))
  );
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return Get(req, res);
  }

  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
