import type { RedisClient } from "@homarr/core/infrastructure/redis";
import { createRedisClient } from "@homarr/core/infrastructure/redis";

/**
 * Creates a new Redis connection
 * @returns redis client
 */
export const createRedisConnection = () => {
  if (Boolean(process.env.CI) || Boolean(process.env.DISABLE_REDIS_LOGS)) {
    // Return null if we are in CI as we don't want to connect to Redis
    return null as unknown as RedisClient;
  }

  return createRedisClient();
};
