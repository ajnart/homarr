import { dbEnv } from "./env";

type DbMappingInput = Record<typeof dbEnv.DRIVER, () => unknown>;

export const createDbMapping = <TInput extends DbMappingInput>(input: TInput) => {
  // The DRIVER can be undefined when validation of env vars is skipped
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return input[dbEnv.DRIVER ?? "better-sqlite3"]() as ReturnType<TInput["better-sqlite3"]>;
};
