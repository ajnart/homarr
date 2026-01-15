import { transports } from "winston";
import type { transport } from "winston";

import { RedisTransport } from "./redis-transport";

const getTransports = () => {
  const defaultTransports: transport[] = [new transports.Console()];

  // Only add the Redis transport if we are not in CI
  if (!(Boolean(process.env.CI) || Boolean(process.env.DISABLE_REDIS_LOGS))) {
    return defaultTransports.concat(
      new RedisTransport({
        level: "debug",
      }),
    );
  }

  return defaultTransports;
};

export const logTransports = getTransports();
