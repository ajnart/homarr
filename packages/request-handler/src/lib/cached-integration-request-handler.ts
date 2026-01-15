import type { Duration } from "dayjs/plugin/duration";

import type { Modify } from "@homarr/common/types";
import type { Integration, IntegrationSecret } from "@homarr/db/schema";
import type { IntegrationKind } from "@homarr/definitions";
import { createIntegrationOptionsChannel } from "@homarr/redis";

import { createCachedRequestHandler } from "./cached-request-handler";

type IntegrationOfKind<TKind extends IntegrationKind> = Omit<Integration, "kind"> & {
  kind: TKind;
  decryptedSecrets: Modify<Pick<IntegrationSecret, "kind" | "value">, { value: string }>[];
  externalUrl: string | null;
};

interface Options<TData, TKind extends IntegrationKind, TInput extends Record<string, unknown>> {
  // Unique key for this request handler
  queryKey: string;
  requestAsync: (integration: IntegrationOfKind<TKind>, input: TInput) => Promise<TData>;
  cacheDuration: Duration;
}

export const createCachedIntegrationRequestHandler = <
  TData,
  TKind extends IntegrationKind,
  TInput extends Record<string, unknown>,
>(
  options: Options<TData, TKind, TInput>,
) => {
  return {
    handler: (integration: IntegrationOfKind<TKind>, itemOptions: TInput) =>
      createCachedRequestHandler({
        queryKey: options.queryKey,
        requestAsync: async (input: { options: TInput; integration: IntegrationOfKind<TKind> }) => {
          return await options.requestAsync(input.integration, input.options);
        },
        cacheDuration: options.cacheDuration,
        createRedisChannel(input, options) {
          return createIntegrationOptionsChannel<TData>(input.integration.id, options.queryKey, input.options);
        },
      }).handler({ options: itemOptions, integration }),
  };
};
