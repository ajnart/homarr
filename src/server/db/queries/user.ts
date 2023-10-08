import { sql } from 'drizzle-orm';

import { db } from '..';
import { users } from '../schema';

export const getTotalUserCountAsync = async () => {
  return await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .then((rows) => rows[0].count);
};
