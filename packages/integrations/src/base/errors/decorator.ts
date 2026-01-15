import { isFunction } from "@homarr/common";
import { createLogger } from "@homarr/core/infrastructure/logs";

import type { Integration } from "../integration";
import type { IIntegrationErrorHandler } from "./handler";
import { integrationFetchHttpErrorHandler } from "./http";
import { IntegrationError } from "./integration-error";
import { IntegrationUnknownError } from "./integration-unknown-error";
import { integrationJsonParseErrorHandler, integrationZodParseErrorHandler } from "./parse";

const logger = createLogger({ module: "handleIntegrationErrors" });

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

const defaultErrorHandlers: IIntegrationErrorHandler[] = [
  integrationZodParseErrorHandler,
  integrationJsonParseErrorHandler,
  integrationFetchHttpErrorHandler,
];

export const HandleIntegrationErrors = (errorHandlers: IIntegrationErrorHandler[]) => {
  const combinedErrorHandlers = [...defaultErrorHandlers, ...errorHandlers];
  return <T extends AbstractConstructor<Integration>>(IntegrationBaseClass: T): T => {
    abstract class ErrorHandledIntegration extends IntegrationBaseClass {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(...args);
        const processedProperties = new Set<string>();

        let currentProto: unknown = Object.getPrototypeOf(this);

        while (currentProto && currentProto !== Object.prototype) {
          for (const propertyKey of Object.getOwnPropertyNames(currentProto)) {
            if (propertyKey === "constructor" || processedProperties.has(propertyKey)) continue;

            const descriptor = Object.getOwnPropertyDescriptor(currentProto, propertyKey);

            if (!descriptor) continue;
            const original: unknown = descriptor.value;
            if (!isFunction(original)) continue;

            processedProperties.add(propertyKey);

            const wrapped = (...methodArgs: unknown[]) => {
              const handleError = (error: unknown) => {
                if (error instanceof IntegrationError) {
                  throw error;
                }

                for (const handler of combinedErrorHandlers) {
                  const handledError = handler.handleError(error, this.publicIntegration);
                  if (!handledError) continue;

                  throw handledError;
                }

                // If the error was handled and should be thrown again, throw it
                logger.debug("Unhandled error in integration", {
                  error: error instanceof Error ? `${error.name}: ${error.message}` : undefined,
                  integrationName: this.publicIntegration.name,
                });
                throw new IntegrationUnknownError(this.publicIntegration, { cause: error });
              };

              try {
                const result = original.apply(this, methodArgs);

                if (result instanceof Promise) {
                  return result.catch((error: unknown) => {
                    handleError(error);
                  });
                }

                return result;
              } catch (error: unknown) {
                handleError(error);
              }
            };

            Object.defineProperty(this, propertyKey, {
              ...descriptor,
              value: wrapped,
            });
          }

          currentProto = Object.getPrototypeOf(currentProto);
        }
      }
    }

    return ErrorHandledIntegration;
  };
};
