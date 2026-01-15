import type { Duration } from "dayjs/plugin/duration";

import type { WidgetKind } from "@homarr/definitions";
import { createWidgetOptionsChannel } from "@homarr/redis";

import { createCachedRequestHandler } from "./cached-request-handler";

interface Options<TData, TKind extends WidgetKind, TInput extends Record<string, unknown>> {
  // Unique key for this request handler
  queryKey: string;
  requestAsync: (input: TInput) => Promise<TData>;
  cacheDuration: Duration;
  widgetKind: TKind;
}

export const createCachedWidgetRequestHandler = <
  TData,
  TKind extends WidgetKind,
  TInput extends Record<string, unknown>,
>(
  requestHandlerOptions: Options<TData, TKind, TInput>,
) => {
  return {
    handler: (widgetOptions: TInput) =>
      createCachedRequestHandler({
        queryKey: requestHandlerOptions.queryKey,
        requestAsync: async (input: TInput) => {
          return await requestHandlerOptions.requestAsync(input);
        },
        cacheDuration: requestHandlerOptions.cacheDuration,
        createRedisChannel(input, options) {
          return createWidgetOptionsChannel<TData>(requestHandlerOptions.widgetKind, options.queryKey, input);
        },
      }).handler(widgetOptions),
  };
};
