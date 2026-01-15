import type { IntegrationError, IntegrationErrorData } from "./integration-error";

export interface IIntegrationErrorHandler {
  handleError(error: unknown, integration: IntegrationErrorData): IntegrationError | undefined;
}
