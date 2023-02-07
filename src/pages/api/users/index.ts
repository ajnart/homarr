import { Prisma } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getServerAuthSession } from '../../../server/common/get-server-auth-session';
import { userFilterSchema } from '../../../validation/user';

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

  const input = await usersInputSchema.safeParseAsync(req.query);

  if (!input.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid body input.',
      data: input.error,
    });
  }

  const filter = getCurrentUserFilter(input.data.filter);

  const users = await prisma?.user.findMany({
    where: {
      AND: [
        {
          username: {
            contains: input.data.search?.toLowerCase() ?? '',
          },
        },
        filter,
      ],
    },
  });

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

const getCurrentUserFilter = (filter: z.infer<typeof userFilterSchema>) => userFilters[filter];

const userFilters: Record<z.infer<typeof userFilterSchema>, Prisma.UserWhereInput> = {
  all: {},
  'user-admin': {
    isAdmin: true,
  },
  'user-non-admin': {
    isAdmin: false,
  },
  'user-enabled': {
    isEnabled: true,
  },
  'user-archived': {
    isEnabled: false,
  },
};

const usersInputSchema = z.object({
  filter: userFilterSchema,
  search: z.string().optional(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return Get(req, res);
  }

  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
