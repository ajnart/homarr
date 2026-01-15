import { RequestError, ResponseError } from "@homarr/common/server";
import type { HttpErrorHandler } from "@homarr/common/server";

import type { IIntegrationErrorHandler } from "../handler";
import type { IntegrationError, IntegrationErrorData } from "../integration-error";
import { IntegrationRequestError } from "./integration-request-error";
import { IntegrationResponseError } from "./integration-response-error";

export class IntegrationHttpErrorHandler implements IIntegrationErrorHandler {
  private readonly httpErrorHandler: HttpErrorHandler;

  constructor(httpErrorHandler: HttpErrorHandler) {
    this.httpErrorHandler = httpErrorHandler;
  }

  handleError(error: unknown, integration: IntegrationErrorData): IntegrationError | undefined {
    if (error instanceof RequestError) return new IntegrationRequestError(integration, { cause: error });
    if (error instanceof ResponseError) return new IntegrationResponseError(integration, { cause: error });

    const requestError = this.httpErrorHandler.handleRequestError(error);
    if (requestError) return new IntegrationRequestError(integration, { cause: requestError });
    const responseError = this.httpErrorHandler.handleResponseError(error);
    if (responseError) return new IntegrationResponseError(integration, { cause: responseError });
    return undefined;
  }
}
