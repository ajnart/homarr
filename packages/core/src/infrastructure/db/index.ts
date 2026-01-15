import { createDbMapping } from "./mapping";

export { createDb } from "./drivers";
export const createSchema = createDbMapping;

export { createMysqlDb } from "./drivers/mysql";
export { createSqliteDb } from "./drivers/sqlite";
export { createPostgresDb } from "./drivers/postgresql";
export { createSharedConfig as createSharedDbConfig } from "./drivers";
