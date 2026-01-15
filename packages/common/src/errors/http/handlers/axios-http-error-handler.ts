import { AxiosError } from "axios";

import type { AnyRequestError } from "../request-error";
import { RequestError } from "../request-error";
import { ResponseError } from "../response-error";
import { matchErrorCode } from "./fetch-http-error-handler";
import { HttpErrorHandler } from "./http-error-handler";

export class AxiosHttpErrorHandler extends HttpErrorHandler {
  constructor() {
    super("axios");
  }

  handleRequestError(error: unknown): AnyRequestError | undefined {
    if (!(error instanceof AxiosError)) return undefined;
    if (error.code === undefined) return undefined;

    this.logRequestError({
      code: error.code,
      message: error.message,
    });

    const requestErrorInput = matchErrorCode(error.code);
    if (!requestErrorInput) return undefined;

    return new RequestError(requestErrorInput, {
      cause: error,
    });
  }
  handleResponseError(error: unknown): ResponseError | undefined {
    if (!(error instanceof AxiosError)) return undefined;
    if (error.response === undefined) return undefined;
    this.logResponseError({
      status: error.response.status,
      url: error.response.config.url,
      message: error.message,
    });

    return new ResponseError({
      status: error.response.status,
      url: error.response.config.url ?? "?",
    });
  }
}
