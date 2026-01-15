import { format } from "winston";

import { formatErrorCause, formatErrorStack } from "./error";
import { formatMetadata } from "./metadata";

export const logFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.errors({ stack: true, cause: true }),
  format.printf(({ level, message, timestamp, cause, stack, ...metadata }) => {
    const firstLine = `${timestamp as string} ${level}: ${message as string} ${formatMetadata(metadata)}`;

    if (!cause && !stack) {
      return firstLine;
    }

    const formatedStack = formatErrorStack(stack as string | undefined);

    if (!cause) {
      return `${firstLine}\n${formatedStack}`;
    }

    return `${firstLine}\n${formatedStack}${formatErrorCause(cause)}`;
  }),
);
