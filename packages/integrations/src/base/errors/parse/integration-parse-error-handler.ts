import { ParseError } from "@homarr/common/server";
import type { ParseErrorHandler } from "@homarr/common/server";

import type { IIntegrationErrorHandler } from "../handler";
import type { IntegrationError, IntegrationErrorData } from "../integration-error";
import { IntegrationParseError } from "./integration-parse-error";

export class IntegrationParseErrorHandler implements IIntegrationErrorHandler {
  private readonly parseErrorHandler: ParseErrorHandler;

  constructor(parseErrorHandler: ParseErrorHandler) {
    this.parseErrorHandler = parseErrorHandler;
  }

  handleError(error: unknown, integration: IntegrationErrorData): IntegrationError | undefined {
    if (error instanceof ParseError) return new IntegrationParseError(integration, { cause: error });
    const parseError = this.parseErrorHandler.handleParseError(error);
    if (parseError) return new IntegrationParseError(integration, { cause: parseError });

    return undefined;
  }
}
