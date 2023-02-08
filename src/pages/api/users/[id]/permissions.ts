import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getServerAuthSession } from '../../../../server/common/get-server-auth-session';
import { checkIfOwnerUser } from '../../../../tools/api/apiMiddleware';
import { getDashboards } from '../../../../tools/getDashboards';

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

  if (await checkIfOwnerUser(input.data.id)) {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'Can not archive owner of homarr.',
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

  const input = await userGetPermissionsInput.safeParseAsync(req.query);

  if (!input.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid body input.',
      data: input.error,
    });
  }

  const dashboards = getDashboards();
  const permissions = await prisma?.dashboardPermission.findMany({
    where: {
      userId: input.data.id,
    },
  });

  return res.status(200).send(
    dashboards.map((id) => ({
      id,
      permission: permissions?.find((p) => p.dashboardId === id) ?? null,
    }))
  );
}

const userGetPermissionsInput = z.object({
  id: z.string(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return Post(req, res);
  }

  if (req.method === 'GET') {
    return Get(req, res);
  }

  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
