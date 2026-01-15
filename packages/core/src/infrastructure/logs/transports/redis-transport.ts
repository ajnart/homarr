import superjson from "superjson";
import Transport from "winston-transport";

import type { RedisClient } from "../../redis/client";
import { createRedisClient } from "../../redis/client";

const messageSymbol = Symbol.for("message");
const levelSymbol = Symbol.for("level");

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
export class RedisTransport extends Transport {
  private redis: RedisClient | null = null;
  public static readonly publishChannel = "pubSub:logging";

  /**
   * Log the info to the Redis channel
   */
  log(info: { [messageSymbol]: string; [levelSymbol]: string }, callback: () => void) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    // Is only initialized here because it did not work when initialized in the constructor or outside the class
    this.redis ??= createRedisClient();

    this.redis
      .publish(
        RedisTransport.publishChannel,
        superjson.stringify({
          message: info[messageSymbol],
          level: info[levelSymbol],
        }),
      )
      .then(() => {
        callback();
      })
      .catch(() => {
        // Ignore errors
      });
  }
}
