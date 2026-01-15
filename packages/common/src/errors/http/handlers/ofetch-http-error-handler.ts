import { FetchError } from "ofetch";

import type { AnyRequestError } from "../request-error";
import { ResponseError } from "../response-error";
import { FetchHttpErrorHandler } from "./fetch-http-error-handler";
import { HttpErrorHandler } from "./http-error-handler";

/**
 * Ofetch is a wrapper around the native fetch API
 * which will always throw the FetchError (also for non successful responses).
 *
 * It is for example used within the ctrl packages like qbittorrent, deluge, transmission, etc.
 */
export class OFetchHttpErrorHandler extends HttpErrorHandler {
  constructor() {
    super("ofetch");
  }

  handleRequestError(error: unknown): AnyRequestError | undefined {
    if (!(error instanceof FetchError)) return undefined;
    if (!(error.cause instanceof TypeError)) return undefined;

    const result = new FetchHttpErrorHandler("ofetch").handleRequestError(error.cause);
    if (!result) return undefined;

    return result;
  }

  handleResponseError(error: unknown): ResponseError | undefined {
    if (!(error instanceof FetchError)) return undefined;
    if (error.response === undefined) return undefined;

    this.logResponseError({
      status: error.response.status,
      url: error.response.url,
    });

    return new ResponseError(error.response);
  }
}
