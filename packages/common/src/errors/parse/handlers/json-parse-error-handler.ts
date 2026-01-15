import { ParseError } from "../parse-error";
import { ParseErrorHandler } from "./parse-error-handler";

export class JsonParseErrorHandler extends ParseErrorHandler {
  constructor() {
    super("json");
  }

  handleParseError(error: unknown): ParseError | undefined {
    if (!(error instanceof SyntaxError)) return undefined;

    this.logParseError({
      message: error.message,
    });

    return new ParseError("Failed to parse json", { cause: error });
  }
}
