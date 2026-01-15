import type { IntegrationErrorData } from "./integration-error";
import { IntegrationError } from "./integration-error";

export class IntegrationUnknownError extends IntegrationError {
  constructor(integration: IntegrationErrorData, { cause }: ErrorOptions) {
    super(integration, "An unknown error occured while executing Integration method", { cause });
  }
}
