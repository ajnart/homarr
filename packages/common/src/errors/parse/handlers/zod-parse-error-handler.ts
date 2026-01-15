import { fromError } from "zod-validation-error";
import { ZodError } from "zod/v4";

import { ParseError } from "../parse-error";
import { ParseErrorHandler } from "./parse-error-handler";

export class ZodParseErrorHandler extends ParseErrorHandler {
  constructor() {
    super("zod");
  }

  handleParseError(error: unknown): ParseError | undefined {
    if (!(error instanceof ZodError)) return undefined;

    // TODO: migrate to zod v4 prettfyError once it's released
    // https://v4.zod.dev/v4#error-pretty-printing
    const message = fromError(error, {
      issueSeparator: "\n",
      prefix: null,
    }).toString();

    this.logParseError();

    return new ParseError(message, { cause: error });
  }
}
