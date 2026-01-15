import { ResponseError } from "@homarr/common/server";

import type { IIntegrationErrorHandler } from "../base/errors/handler";
import { integrationFetchHttpErrorHandler } from "../base/errors/http";
import { IntegrationResponseError } from "../base/errors/http/integration-response-error";
import type { IntegrationError, IntegrationErrorData } from "../base/errors/integration-error";

export class ProxmoxApiErrorHandler implements IIntegrationErrorHandler {
  handleError(error: unknown, integration: IntegrationErrorData): IntegrationError | undefined {
    if (!(error instanceof Error)) return undefined;
    if (error.cause && error.cause instanceof TypeError) {
      return integrationFetchHttpErrorHandler.handleError(error.cause, integration);
    }

    if (error.message.includes(" return Error 400 "))
      return new IntegrationResponseError(integration, { cause: new ResponseError({ status: 400 }, { cause: error }) });
    if (error.message.includes(" return Error 500 "))
      return new IntegrationResponseError(integration, { cause: new ResponseError({ status: 500 }, { cause: error }) });
    if (error.message.includes(" return Error 401 "))
      return new IntegrationResponseError(integration, { cause: new ResponseError({ status: 401 }, { cause: error }) });

    const otherStatusCode = /connection failed with (\d{3})/.exec(error.message)?.at(1);
    if (!otherStatusCode) return undefined;

    const statusCode = parseInt(otherStatusCode, 10);
    return new IntegrationResponseError(integration, {
      cause: new ResponseError({ status: statusCode }, { cause: error }),
    });
  }
}
