import SuperJSON from "superjson";

import { hashObjectBase64, Stopwatch } from "@homarr/common";
import { decryptSecret } from "@homarr/common/server";
import type { MaybeArray } from "@homarr/common/types";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import { db } from "@homarr/db";
import { getItemsWithIntegrationsAsync, getServerSettingsAsync } from "@homarr/db/queries";
import type { WidgetKind } from "@homarr/definitions";

// This imports are done that way to avoid circular dependencies.
import type { inferSupportedIntegrationsStrict } from "../../../widgets/src";
import { reduceWidgetOptionsWithDefaultValues } from "../../../widgets/src";
import type { WidgetComponentProps } from "../../../widgets/src/definition";
import type { createCachedIntegrationRequestHandler } from "./cached-integration-request-handler";

const logger = createLogger({ module: "cachedRequestIntegrationJobHandler" });

export const createRequestIntegrationJobHandler = <
  TWidgetKind extends WidgetKind,
  TIntegrationKind extends inferSupportedIntegrationsStrict<TWidgetKind>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  THandler extends ReturnType<typeof createCachedIntegrationRequestHandler<any, TIntegrationKind, any>>["handler"],
>(
  handler: THandler,
  {
    widgetKinds,
    getInput,
  }: {
    widgetKinds: TWidgetKind[];
    getInput: {
      [key in TWidgetKind]: (options: WidgetComponentProps<key>["options"]) => MaybeArray<Parameters<THandler>[1]>;
    };
  },
) => {
  return async () => {
    const serverSettings = await getServerSettingsAsync(db);
    const itemsForIntegration = await getItemsWithIntegrationsAsync(db, {
      kinds: widgetKinds,
    });

    logger.debug("Found items for integration", {
      widgetKinds: widgetKinds.join(","),
      count: itemsForIntegration.length,
    });

    const distinctIntegrations: {
      integrationId: string;
      inputHash: string;
      integration: (typeof itemsForIntegration)[number]["integrations"][number]["integration"];
      input: Parameters<THandler>[1];
    }[] = [];

    for (const itemForIntegration of itemsForIntegration) {
      const oneOrMultipleInputs = getInput[itemForIntegration.kind](
        reduceWidgetOptionsWithDefaultValues(
          itemForIntegration.kind,
          {
            enableStatusByDefault: serverSettings.board.enableStatusByDefault,
            forceDisableStatus: serverSettings.board.forceDisableStatus,
          },
          SuperJSON.parse<Record<string, unknown>>(itemForIntegration.options),
        ) as never,
      );
      for (const { integration } of itemForIntegration.integrations) {
        const inputArray = Array.isArray(oneOrMultipleInputs) ? oneOrMultipleInputs : [oneOrMultipleInputs];

        for (const input of inputArray) {
          const inputHash = hashObjectBase64(input);
          if (
            distinctIntegrations.some(
              (distinctIntegration) =>
                distinctIntegration.integrationId === integration.id && distinctIntegration.inputHash === inputHash,
            )
          ) {
            continue;
          }

          distinctIntegrations.push({ integrationId: integration.id, inputHash, integration, input });
        }
      }
    }

    for (const { integrationId, integration, input, inputHash } of distinctIntegrations) {
      try {
        const decryptedSecrets = integration.secrets.map((secret) => ({
          ...secret,
          value: decryptSecret(secret.value),
        }));

        const innerHandler = handler(
          {
            ...integration,
            kind: integration.kind as TIntegrationKind,
            decryptedSecrets,
            externalUrl: integration.app?.href ?? null,
          },
          input,
        );
        const stopWatch = new Stopwatch();
        await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: true });
        logger.debug("Ran integration job", {
          integration: integrationId,
          inputHash,
          elapsed: stopWatch.getElapsedInHumanWords(),
        });
      } catch (error) {
        logger.error(
          new ErrorWithMetadata("Failed to run integration job", { integrationId, inputHash }, { cause: error }),
        );
      }
    }
  };
};
