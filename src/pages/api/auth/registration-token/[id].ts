import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getServerAuthSession } from '../../../../server/common/get-server-auth-session';

const Delete = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const result = await deletionSchema.safeParseAsync(req.query);
  if (!result.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid body input.',
      data: result.error,
    });
  }

  try {
    await prisma?.registrationToken.delete({
      where: {
        id: result.data.id,
      },
    });
    res.status(200).json({
      message: 'Removed token successfully',
    });
  } catch {
    res.status(404).json({
      code: 'NOT_FOUND',
      message: 'The specified token has not been found.',
    });
  }
};

const deletionSchema = z.object({
  id: z.string(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'DELETE') {
    return Delete(req, res);
  }

  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
