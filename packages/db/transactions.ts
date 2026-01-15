import { isMysql, isPostgresql } from "./collection";
import type { HomarrDatabase, HomarrDatabaseMysql } from "./driver";
import type { MySqlSchema } from "./schema";
import * as schema from "./schema";

interface HandleTransactionInput {
  handleAsync: (db: HomarrDatabaseMysql, schema: MySqlSchema) => Promise<void>;
  handleSync: (db: HomarrDatabase) => void;
}

/**
 * The below method is mostly used to handle transactions in different database drivers.
 * As better-sqlite3 transactions have to be synchronous, we have to implement them in a different way.
 * But it can also generally be used when dealing with different database drivers.
 */
export const handleDiffrentDbDriverOperationsAsync = async (db: HomarrDatabase, input: HandleTransactionInput) => {
  if (isMysql() || isPostgresql()) {
    // Schema type is always the correct one based on env variables
    await input.handleAsync(db as unknown as HomarrDatabaseMysql, schema as unknown as MySqlSchema);
  } else {
    input.handleSync(db);
  }
};
