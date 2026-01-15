import type { X509Certificate } from "node:crypto";

import type { AnyRequestError, ParseError, RequestError } from "@homarr/common/server";

import { IntegrationRequestError } from "../errors/http/integration-request-error";
import { IntegrationResponseError } from "../errors/http/integration-response-error";
import type { IntegrationError } from "../errors/integration-error";
import { IntegrationUnknownError } from "../errors/integration-unknown-error";
import { IntegrationParseError } from "../errors/parse/integration-parse-error";

export type TestConnectionErrorType = keyof TestConnectionErrorMap;
export type AnyTestConnectionError = {
  [TType in TestConnectionErrorType]: TestConnectionError<TType>;
}[TestConnectionErrorType];
export type TestConnectionErrorDataOfType<TType extends TestConnectionErrorType> = TestConnectionErrorMap[TType];

export class TestConnectionError<TType extends TestConnectionErrorType> extends Error {
  public readonly type: TType;
  public readonly data: TestConnectionErrorMap[TType];

  private constructor(type: TType, data: TestConnectionErrorMap[TType], options?: { cause: Error }) {
    super("Unable to connect to the integration", options);
    this.name = TestConnectionError.name;
    this.type = type;
    this.data = data;
  }

  get cause(): Error | undefined {
    return super.cause as Error | undefined;
  }

  public toResult() {
    return {
      success: false,
      error: this,
    } as const;
  }

  private static Unknown(cause: unknown) {
    return new TestConnectionError(
      "unknown",
      undefined,
      cause instanceof Error
        ? {
            cause,
          }
        : undefined,
    );
  }

  public static UnknownResult(cause: unknown) {
    return this.Unknown(cause).toResult();
  }

  private static Certificate(requestError: RequestError<"certificate">, certificate: X509Certificate) {
    return new TestConnectionError(
      "certificate",
      {
        requestError,
        certificate,
      },
      {
        cause: requestError,
      },
    );
  }

  public static CertificateResult(requestError: RequestError<"certificate">, certificate: X509Certificate) {
    return this.Certificate(requestError, certificate).toResult();
  }

  private static Authorization(statusCode: number) {
    return new TestConnectionError("authorization", {
      statusCode,
      reason: statusCode === 403 ? "forbidden" : "unauthorized",
    });
  }

  public static UnauthorizedResult(statusCode: number) {
    return this.Authorization(statusCode).toResult();
  }

  private static Status(input: { status: number; url: string }) {
    if (input.status === 401 || input.status === 403) return this.Authorization(input.status);

    // We don't want to leak the query parameters in the error message
    const urlWithoutQuery = new URL(input.url);
    urlWithoutQuery.search = "";

    return new TestConnectionError("statusCode", {
      statusCode: input.status,
      reason: input.status in statusCodeMap ? statusCodeMap[input.status as keyof typeof statusCodeMap] : "other",
      url: urlWithoutQuery.toString(),
    });
  }

  public static StatusResult(input: { status: number; url: string }) {
    return this.Status(input).toResult();
  }

  private static Request(requestError: Exclude<AnyRequestError, RequestError<"certificate">>) {
    return new TestConnectionError(
      "request",
      { requestError },
      {
        cause: requestError,
      },
    );
  }

  public static RequestResult(requestError: Exclude<AnyRequestError, RequestError<"certificate">>) {
    return this.Request(requestError).toResult();
  }

  private static Parse(cause: ParseError) {
    return new TestConnectionError("parse", undefined, { cause });
  }

  public static ParseResult(cause: ParseError) {
    return this.Parse(cause).toResult();
  }

  static FromIntegrationError(error: IntegrationError): AnyTestConnectionError {
    if (error instanceof IntegrationUnknownError) {
      return this.Unknown(error.cause);
    }
    if (error instanceof IntegrationRequestError) {
      if (error.cause.type === "certificate") {
        return this.Unknown(new Error("FromIntegrationError can not be used for certificate errors", { cause: error }));
      }

      return this.Request(error.cause);
    }
    if (error instanceof IntegrationResponseError) {
      return this.Status({
        status: error.cause.statusCode,
        url: error.cause.url ?? "?",
      });
    }
    if (error instanceof IntegrationParseError) {
      return this.Parse(error.cause);
    }

    return this.Unknown(new Error("FromIntegrationError received unknown IntegrationError", { cause: error }));
  }
}

const statusCodeMap = {
  400: "badRequest",
  404: "notFound",
  429: "tooManyRequests",
  500: "internalServerError",
  503: "serviceUnavailable",
  504: "gatewayTimeout",
} as const;

interface TestConnectionErrorMap {
  unknown: undefined;
  parse: undefined;
  authorization: {
    statusCode: number;
    reason: "unauthorized" | "forbidden";
  };
  statusCode: {
    statusCode: number;
    reason: (typeof statusCodeMap)[keyof typeof statusCodeMap] | "other";
    url: string;
  };
  certificate: {
    requestError: RequestError<"certificate">;
    certificate: X509Certificate;
  };
  request: {
    requestError: Exclude<AnyRequestError, RequestError<"certificate">>;
  };
}
