import type { AnyRequestError, RequestError, RequestErrorType } from "@homarr/common/server";

import type { IntegrationErrorData } from "../integration-error";
import { IntegrationError } from "../integration-error";

export type IntegrationRequestErrorOfType<TType extends RequestErrorType> = IntegrationRequestError & {
  cause: RequestError<TType>;
};

export class IntegrationRequestError extends IntegrationError {
  constructor(integration: IntegrationErrorData, { cause }: { cause: AnyRequestError }) {
    super(integration, "Request to integration failed", { cause });
    this.name = IntegrationRequestError.name;
  }

  get cause(): AnyRequestError {
    return super.cause as AnyRequestError;
  }
}
