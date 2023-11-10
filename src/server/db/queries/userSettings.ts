import { eq } from 'drizzle-orm';

import { db } from '..';
import { userSettings } from '../schema';

export const getDefaultBoardAsync = async (
  userId: string | undefined,
  fallback: string = 'default'
) => {
  if (!userId) {
    return fallback;
  }
  return await db.query.userSettings
    .findFirst({
      where: eq(userSettings.userId, userId),
    })
    .then((settings) => settings?.defaultBoard ?? fallback);
};
