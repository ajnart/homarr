import { max } from "drizzle-orm";

import type { HomarrDatabase } from "../driver";
import { groups } from "../schema";

export const getMaxGroupPositionAsync = async (db: HomarrDatabase) => {
  return await db
    .select({ value: max(groups.position) })
    .from(groups)
    .then((result) => result[0]?.value ?? 1);
};
