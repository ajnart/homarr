import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const trustedCertificateHostnames = sqliteTable(
  "trusted_certificate_hostname",
  {
    hostname: text().notNull(),
    thumbprint: text().notNull(),
    certificate: text().notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.hostname, table.thumbprint],
    }),
  }),
);
