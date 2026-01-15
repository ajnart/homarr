import { pgTable, primaryKey, text, varchar } from "drizzle-orm/pg-core";

export const trustedCertificateHostnames = pgTable(
  "trusted_certificate_hostname",
  {
    hostname: varchar({ length: 256 }).notNull(),
    thumbprint: varchar({ length: 128 }).notNull(),
    certificate: text().notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.hostname, table.thumbprint],
    }),
  }),
);
