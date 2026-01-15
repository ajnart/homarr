import { RequestError as OctokitRequestError } from "octokit";

import type { AnyRequestError } from "../request-error";
import { ResponseError } from "../response-error";
import { HttpErrorHandler } from "./http-error-handler";

export class OctokitHttpErrorHandler extends HttpErrorHandler {
  constructor() {
    super("octokit");
  }

  /**
   * I wasn't able to get a request error triggered. Therefore we ignore them for now
   * and just forward them as unknown errors
   */
  handleRequestError(_: unknown): AnyRequestError | undefined {
    return undefined;
  }

  handleResponseError(error: unknown): ResponseError | undefined {
    if (!(error instanceof OctokitRequestError)) return undefined;

    this.logResponseError({
      status: error.status,
      url: error.response?.url,
    });

    return new ResponseError({
      status: error.status,
      url: error.response?.url,
    });
  }
}
