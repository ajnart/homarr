import type { RedisOptions } from "ioredis";
import { Redis } from "ioredis";

import { redisEnv } from "./env";

const defaultRedisOptions = {
  connectionName: "homarr",
} satisfies RedisOptions;

export type { Redis as RedisClient } from "ioredis";

export const createRedisClient = () =>
  redisEnv.IS_EXTERNAL
    ? new Redis({
        ...defaultRedisOptions,
        host: redisEnv.HOST,
        port: redisEnv.PORT,
        db: redisEnv.DATABASE_INDEX,
        tls: redisEnv.TLS_CA
          ? {
              ca: redisEnv.TLS_CA,
            }
          : undefined,
        username: redisEnv.USERNAME,
        password: redisEnv.PASSWORD,
      })
    : new Redis(defaultRedisOptions);
