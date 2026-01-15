import { createSchema } from "../../../db";
import * as mysql from "./mysql";
import * as postgresql from "./postgresql";
import * as sqlite from "./sqlite";

export const schema = createSchema({
  "better-sqlite3": () => sqlite,
  mysql2: () => mysql,
  "node-postgres": () => postgresql,
});
