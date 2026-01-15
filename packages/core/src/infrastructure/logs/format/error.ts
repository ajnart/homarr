import { logsEnv } from "../env";
import { formatMetadata } from "./metadata";

const ERROR_OBJECT_PRUNE_DEPTH = logsEnv.LEVEL === "debug" ? 10 : 3;
const ERROR_STACK_LINE_LIMIT = logsEnv.LEVEL === "debug" ? undefined : 5;
const ERROR_CAUSE_DEPTH = logsEnv.LEVEL === "debug" ? 10 : 5;

/**
 * Formats the cause of an error in the format
 * @example caused by Error: {message}
 * {stack-trace}
 * @param cause next cause in the chain
 * @param iteration current iteration of the function
 * @returns formatted and stacked causes
 */
export const formatErrorCause = (cause: unknown, iteration = 0): string => {
  // Prevent infinite recursion
  if (iteration > ERROR_CAUSE_DEPTH) {
    return "";
  }

  if (cause instanceof Error) {
    if (!cause.cause) {
      return `\ncaused by ${formatErrorTitle(cause)}\n${formatErrorStack(cause.stack)}`;
    }

    return `\ncaused by ${formatErrorTitle(cause)}\n${formatErrorStack(cause.stack)}${formatErrorCause(cause.cause, iteration + 1)}`;
  }

  if (typeof cause === "object" && cause !== null) {
    if ("cause" in cause) {
      const { cause: innerCause, ...rest } = cause;
      return `\ncaused by ${JSON.stringify(prune(rest, ERROR_OBJECT_PRUNE_DEPTH))}${formatErrorCause(innerCause, iteration + 1)}`;
    }
    return `\ncaused by ${JSON.stringify(prune(cause, ERROR_OBJECT_PRUNE_DEPTH))}`;
  }

  return `\ncaused by ${cause as string}`;
};

const ignoredErrorProperties = ["stack", "message", "name", "cause"];

/**
 * Formats the title of an error
 * @example {name}: {message} {metadata}
 * @param error error to format title from
 * @returns formatted error title
 */
export const formatErrorTitle = (error: Error) => {
  const title = error.message.length === 0 ? error.name : `${error.name}: ${error.message}`;
  const metadata = formatMetadata(error, ignoredErrorProperties);

  return `${title} ${metadata}`;
};

/**
 * Formats the stack trance of an error
 * We remove the first line as it contains the error name and message
 * @param stack stack trace
 * @returns formatted stack trace
 */
export const formatErrorStack = (stack: string | undefined) =>
  stack
    ?.split("\n")
    .slice(1, ERROR_STACK_LINE_LIMIT ? ERROR_STACK_LINE_LIMIT + 1 : undefined)
    .join("\n") ?? "";

/**
 * Removes nested properties from an object beyond a certain depth
 */
const prune = (value: unknown, depth: number): unknown => {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    if (depth === 0) return [];
    return value.map((item) => prune(item, depth - 1));
  }

  if (depth === 0) {
    return {};
  }

  return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, prune(val, depth - 1)]));
};
