import { randomUUID } from "crypto";

import type { MaybePromise } from "@homarr/common/types";
import { createLogger } from "@homarr/core/infrastructure/logs";

import { createRedisConnection } from "./connection";

const logger = createLogger({ module: "channelSubscriptionTracker" });

type SubscriptionCallback = (message: string) => MaybePromise<void>;

/**
 * This class is used to deduplicate redis subscriptions.
 * It keeps track of all subscriptions and only subscribes to a channel if there are any subscriptions to it.
 * It also provides a way to remove the callback from the channel.
 * It fixes a potential memory leak where the redis client would keep creating new subscriptions to the same channel.
 * @see https://github.com/homarr-labs/homarr/issues/744
 */
export class ChannelSubscriptionTracker {
  private static subscriptions = new Map<string, Map<string, SubscriptionCallback>>();
  private static redis = createRedisConnection();
  private static listenerActive = false;

  /**
   * Subscribes to a channel.
   * @param channelName name of the channel
   * @param callback callback function to be called when a message is received
   * @returns a function to unsubscribe from the channel
   */
  public static subscribe(channelName: string, callback: SubscriptionCallback) {
    logger.debug("Adding redis channel callback", { channel: channelName });

    // We only want to activate the listener once
    if (!this.listenerActive) {
      this.activateListener();
      this.listenerActive = true;
    }

    const channelSubscriptions = this.subscriptions.get(channelName) ?? new Map<string, SubscriptionCallback>();
    const id = randomUUID();

    // If there are no subscriptions to the channel, subscribe to it
    if (channelSubscriptions.size === 0) {
      logger.debug("Subscribing to redis channel", { channel: channelName });
      void this.redis.subscribe(channelName);
    }

    logger.debug("Adding redis channel callback", { channel: channelName, id });
    channelSubscriptions.set(id, callback);

    this.subscriptions.set(channelName, channelSubscriptions);

    // Return a function to unsubscribe
    return () => {
      logger.debug("Removing redis channel callback", { channel: channelName, id });

      const channelSubscriptions = this.subscriptions.get(channelName);
      if (!channelSubscriptions) return;

      channelSubscriptions.delete(id);

      // If there are no subscriptions to the channel, unsubscribe from it
      if (channelSubscriptions.size >= 1) {
        return;
      }

      logger.debug("Unsubscribing from redis channel", { channel: channelName });
      void this.redis.unsubscribe(channelName);
      this.subscriptions.delete(channelName);
    };
  }

  /**
   * Activates the listener for the redis client.
   */
  private static activateListener() {
    logger.debug("Activating listener");
    this.redis.on("message", (channel, message) => {
      const channelSubscriptions = this.subscriptions.get(channel);
      if (!channelSubscriptions) {
        logger.warn("Received message on unknown channel", { channel });
        return;
      }

      for (const [id, callback] of channelSubscriptions.entries()) {
        // Don't log messages from the logging channel as it would create an infinite loop
        if (channel !== "pubSub:logging") {
          logger.debug("Calling subscription callback", { channel, id });
        }
        void callback(message);
      }
    });
  }
}
