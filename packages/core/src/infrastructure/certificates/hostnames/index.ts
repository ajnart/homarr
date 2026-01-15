import type { InferSelectModel } from "drizzle-orm";

import { createDb } from "../../db";
import { schema } from "./db/schema";

const db = createDb(schema);

export const getTrustedCertificateHostnamesAsync = async () => {
  return await db.query.trustedCertificateHostnames.findMany();
};

export type TrustedCertificateHostname = InferSelectModel<typeof schema.trustedCertificateHostnames>;
