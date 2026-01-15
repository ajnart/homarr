import type { DrizzleConfig, Logger } from "drizzle-orm";

import { createLogger } from "../../logs";

export type SharedDrizzleConfig<TSchema extends Record<string, unknown>> = Required<
  Pick<DrizzleConfig<TSchema>, "logger" | "casing" | "schema">
>;

const logger = createLogger({ module: "db" });

export class WinstonDrizzleLogger implements Logger {
  logQuery(query: string, _: unknown[]): void {
    logger.debug("Executed SQL query", { query });
  }
}
