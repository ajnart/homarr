import superjson from "superjson";

import { decryptSecret, encryptSecret } from "@homarr/common/server";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import { createGetSetChannel } from "@homarr/redis";

const logger = createLogger({ module: "sessionStore" });

export const createSessionStore = <TValue>(integration: { id: string }) => {
  const channelName = `session-store:${integration.id}`;
  const channel = createGetSetChannel<`${string}.${string}`>(channelName);

  return {
    async getAsync() {
      logger.debug("Getting session from store", { store: channelName });
      const value = await channel.getAsync();
      if (!value) return null;
      try {
        return superjson.parse<TValue>(decryptSecret(value));
      } catch (error) {
        logger.warn("Failed to load session", { store: channelName, error });
        return null;
      }
    },
    async setAsync(value: TValue) {
      logger.debug("Updating session in store", { store: channelName });
      try {
        await channel.setAsync(encryptSecret(superjson.stringify(value)));
      } catch (error) {
        logger.error(new ErrorWithMetadata("Failed to save session", { store: channelName }, { cause: error }));
      }
    },
    async clearAsync() {
      logger.debug("Cleared session in store", { store: channelName });
      await channel.removeAsync();
    },
  };
};

export type SessionStore<TValue> = ReturnType<typeof createSessionStore<TValue>>;
