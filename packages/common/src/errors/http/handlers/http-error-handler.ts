import type { ILogger } from "@homarr/core/infrastructure/logs";
import { createLogger } from "@homarr/core/infrastructure/logs";

import type { AnyRequestError } from "../request-error";
import type { ResponseError } from "../response-error";

export abstract class HttpErrorHandler {
  protected logger: ILogger;

  constructor(type: string) {
    this.logger = createLogger({ module: "httpErrorHandler", type });
  }

  protected logRequestError<T extends { code: string }>(metadata: T) {
    this.logger.debug("Received request error", metadata);
  }

  protected logResponseError<T extends { status: number; url: string | undefined }>(metadata: T) {
    this.logger.debug("Received response error", metadata);
  }

  abstract handleRequestError(error: unknown): AnyRequestError | undefined;
  abstract handleResponseError(error: unknown): ResponseError | undefined;
}
