import dayjs from "dayjs";
import type { Duration } from "dayjs/plugin/duration";

import { createLogger } from "@homarr/core/infrastructure/logs";
import type { createChannelWithLatestAndEvents } from "@homarr/redis";

const logger = createLogger({ module: "cachedRequestHandler" });

interface Options<TData, TInput extends Record<string, unknown>> {
  // Unique key for this request handler
  queryKey: string;
  requestAsync: (input: TInput) => Promise<TData>;
  createRedisChannel: (
    input: TInput,
    options: Options<TData, TInput>,
  ) => ReturnType<typeof createChannelWithLatestAndEvents<TData>>;
  cacheDuration: Duration;
}

export const createCachedRequestHandler = <TData, TInput extends Record<string, unknown>>(
  options: Options<TData, TInput>,
) => {
  return {
    handler: (input: TInput) => {
      const channel = options.createRedisChannel(input, options);

      return {
        async getCachedOrUpdatedDataAsync({ forceUpdate = false }) {
          const requestNewDataAsync = async () => {
            const data = await options.requestAsync(input);
            await channel.publishAndUpdateLastStateAsync(data);
            return {
              data,
              timestamp: new Date(),
            };
          };

          if (forceUpdate) {
            logger.debug("Cached request handler forced update", {
              channel: channel.name,
              queryKey: options.queryKey,
            });
            return await requestNewDataAsync();
          }

          const channelData = await channel.getAsync();

          const shouldRequestNewData =
            !channelData ||
            dayjs().diff(channelData.timestamp, "milliseconds") > options.cacheDuration.asMilliseconds();

          if (shouldRequestNewData) {
            logger.debug("Cached request handler cache miss", {
              channel: channel.name,
              queryKey: options.queryKey,
              reason: !channelData ? "no data" : "cache expired",
            });
            return await requestNewDataAsync();
          }

          logger.debug("Cached request handler cache hit", {
            channel: channel.name,
            queryKey: options.queryKey,
            expiresAt: dayjs(channelData.timestamp).add(options.cacheDuration).toISOString(),
          });

          return channelData;
        },
        async invalidateAsync() {
          logger.debug("Cached request handler invalidating cache", {
            channel: channel.name,
            queryKey: options.queryKey,
          });
          await this.getCachedOrUpdatedDataAsync({ forceUpdate: true });
        },
        subscribe(callback: (data: TData) => void) {
          return channel.subscribe(callback);
        },
      };
    },
  };
};
