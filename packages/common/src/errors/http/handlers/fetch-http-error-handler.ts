import { objectEntries } from "../../../object";
import type { Modify } from "../../../types";
import type { AnyRequestError, AnyRequestErrorInput, RequestErrorCode, RequestErrorReason } from "../request-error";
import { RequestError, requestErrorMap } from "../request-error";
import type { ResponseError } from "../response-error";
import { HttpErrorHandler } from "./http-error-handler";

export class FetchHttpErrorHandler extends HttpErrorHandler {
  constructor(private type = "undici") {
    super(type);
  }

  handleRequestError(error: unknown): AnyRequestError | undefined {
    if (!isTypeErrorWithCode(error)) return undefined;

    this.logRequestError({
      code: error.cause.code,
    });

    const result = matchErrorCode(error.cause.code);
    if (!result) return undefined;

    return new RequestError(result, { cause: error });
  }

  /**
   * Response errors do not exist for fetch as it does not throw errors for non successful responses.
   */
  handleResponseError(_: unknown): ResponseError | undefined {
    return undefined;
  }
}

type TypeErrorWithCode = Modify<
  TypeError,
  {
    cause: Error & { code: string };
  }
>;

const isTypeErrorWithCode = (error: unknown): error is TypeErrorWithCode => {
  return (
    error instanceof TypeError &&
    error.cause instanceof Error &&
    "code" in error.cause &&
    typeof error.cause.code === "string"
  );
};

export const matchErrorCode = (code: string): AnyRequestErrorInput | undefined => {
  for (const [key, value] of objectEntries(requestErrorMap)) {
    const entries = Object.entries(value) as [string, string | string[]][];
    const found = entries.find(([_, entryCode]) =>
      typeof entryCode === "string" ? entryCode === code : entryCode.includes(code),
    );
    if (!found) continue;

    return {
      type: key,
      reason: found[0] as RequestErrorReason<typeof key>,
      code: code as RequestErrorCode,
    };
  }

  return undefined;
};
