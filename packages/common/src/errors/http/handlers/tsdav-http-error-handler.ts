import type { AnyRequestError } from "../request-error";
import { ResponseError } from "../response-error";
import { HttpErrorHandler } from "./http-error-handler";
import { NodeFetchHttpErrorHandler } from "./node-fetch-http-error-handler";

export class TsdavHttpErrorHandler extends HttpErrorHandler {
  constructor() {
    super("tsdav");
  }

  handleRequestError(error: unknown): AnyRequestError | undefined {
    return new NodeFetchHttpErrorHandler("tsdav").handleRequestError(error);
  }

  handleResponseError(error: unknown): ResponseError | undefined {
    if (!(error instanceof Error)) return undefined;
    // Tsdav sadly does not throw a custom error and rather just uses "Error"
    // https://github.com/natelindev/tsdav/blob/bf33f04b1884694d685ee6f2b43fe9354b12d167/src/account.ts#L86
    if (error.message !== "Invalid credentials") return undefined;

    this.logResponseError({
      status: 401,
      url: undefined,
    });

    return new ResponseError({ status: 401, url: "?" });
  }
}
