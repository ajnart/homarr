import { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '../../../../server/common/get-server-auth-session';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession({ req, res });

  if (!session) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized.',
    });
  }

  const user = await prisma?.user.findFirst({
    where: { id: session?.user?.id },
  });

  if (!user?.isAdmin) {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'User does not have enough privileges.',
    });
  }

  const events = await prisma?.securityEvent.findMany({
    orderBy: {
      timestamp: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return res.status(200).json(
    events?.map((e) => ({
      ...e,
      data: JSON.parse(e.data),
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
