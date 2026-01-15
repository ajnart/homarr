import type { z } from "zod/v4";

import type { ScopedTranslationFunction, TranslationFunction, TranslationObject } from "@homarr/translation";

export const zodErrorMap = (t: TranslationFunction): z.core.$ZodErrorMap<z.core.$ZodIssue> => {
  return (issue) => {
    const error = handleError(issue);
    if (typeof error === "string") {
      return error;
    }
    return t(`common.zod.errors.${error.key}`, (error.params ?? {}) as never);
  };
};

type ValidTranslationKeys = Parameters<ScopedTranslationFunction<"common.zod.errors">>[0];

type HandlerReturnValue =
  | string
  | {
      key: ValidTranslationKeys;
      params?: Record<string, string | number>;
    };

const handleError = (issue: z.core.$ZodRawIssue): HandlerReturnValue => {
  if (issue.code === "too_big") return handleTooBigError(issue);
  if (issue.code === "too_small") return handleTooSmallError(issue);
  if (issue.code === "invalid_format") return handleInvalidFormatError(issue);
  if (issue.code === "invalid_type" && issue.expected === "string" && issue.input === null) {
    return {
      key: "required",
    };
  }
  if (issue.code === "custom" && issue.params?.i18n) {
    const i18n = issue.params.i18n as { key: CustomErrorKey; params?: Record<string, string | number> };
    return {
      key: `custom.${i18n.key}`,
      params: i18n.params,
    };
  }

  return (
    issue.message ?? {
      key: "default",
    }
  );
};

const handleTooBigError = (
  issue: Pick<z.core.$ZodIssueTooBig, "origin" | "maximum"> & { message?: string },
): HandlerReturnValue => {
  if (issue.origin !== "string" && issue.origin !== "number") {
    return (
      issue.message ?? {
        key: "default",
      }
    );
  }

  const origin = issue.origin as "string" | "number";

  return {
    key: `tooBig.${origin}`,
    params: {
      maximum: issue.maximum.toString(),
      count: issue.maximum.toString(),
    },
  } as const;
};

const handleTooSmallError = (
  issue: Pick<z.core.$ZodIssueTooSmall, "origin" | "minimum"> & { message?: string },
): HandlerReturnValue => {
  if (issue.origin !== "string" && issue.origin !== "number") {
    return (
      issue.message ?? {
        key: "default",
      }
    );
  }

  const origin = issue.origin as "string" | "number";
  if (origin === "string" && issue.minimum === 1) {
    return {
      key: "required",
    } as const;
  }
  return {
    key: `tooSmall.${origin}`,
    params: {
      minimum: issue.minimum.toString(),
      count: issue.minimum.toString(),
    },
  } as const;
};

const handleInvalidFormatError = (
  issue: Pick<z.core.$ZodIssueInvalidStringFormat, "format"> & { message?: string },
): HandlerReturnValue => {
  if (issue.format === "includes" && "includes" in issue && typeof issue.includes === "string") {
    return {
      key: "string.includes",
      params: {
        includes: issue.includes,
      },
    } as const;
  }

  if (issue.format === "ends_with" && "suffix" in issue && typeof issue.suffix === "string") {
    return {
      key: "string.endsWith",
      params: {
        endsWith: issue.suffix,
      },
    } as const;
  }

  if (issue.format === "starts_with" && "prefix" in issue && typeof issue.prefix === "string") {
    return {
      key: "string.startsWith",
      params: {
        startsWith: issue.prefix,
      },
    } as const;
  }

  if (issue.format === "email") {
    return {
      key: "string.invalidEmail",
    } as const;
  }

  return (
    issue.message ?? {
      key: "default",
    }
  );
};

type CustomErrorKey = keyof TranslationObject["common"]["zod"]["errors"]["custom"];

export interface CustomErrorParams<TKey extends CustomErrorKey> {
  i18n: {
    key: TKey;
    params: Record<string, unknown>;
  };
}

export const createCustomErrorParams = <TKey extends CustomErrorKey>(
  i18n: keyof CustomErrorParams<TKey>["i18n"]["params"] extends never
    ? CustomErrorParams<TKey>["i18n"]["key"]
    : CustomErrorParams<TKey>["i18n"],
) => (typeof i18n === "string" ? { i18n: { key: i18n, params: {} } } : { i18n });
