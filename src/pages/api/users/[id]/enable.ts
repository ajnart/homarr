import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getServerAuthSession } from '../../../../server/common/get-server-auth-session';

async function Post(req: NextApiRequest, res: NextApiResponse) {
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

  const input = await userArchiveInputSchema.safeParseAsync(req.query);

  if (!input.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid body input.',
      data: input.error,
    });
  }

  await prisma?.user.update({
    where: {
      id: input.data.id,
    },
    data: {
      isEnabled: true,
    },
  });

  return res.status(200).end();
}

const userArchiveInputSchema = z.object({
  id: z.string(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return Post(req, res);
  }

  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
