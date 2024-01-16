import { zodResolver } from '@mantine/form';
import { TFunction } from 'i18next';
import { useTranslation } from 'next-i18next';
import { ErrorMapCtx, z, ZodIssueCode, ZodSchema, ZodTooBigIssue, ZodTooSmallIssue } from 'zod';

export const useI18nZodResolver = () => {
  const { t } = useTranslation('zod');
  return {
    i18nZodResolver: i18nZodResolver(t),
  };
};

const i18nZodResolver =
  (t: TFunction<'zod', undefined, 'zod'>) =>
  <TSchema extends ZodSchema<Record<string, any>>>(schema: TSchema) => {
    z.setErrorMap(zodErrorMap(t));
    return zodResolver(schema);
  };

const handleStringError = (issue: z.ZodInvalidStringIssue, ctx: ErrorMapCtx) => {
  if (typeof issue.validation === 'object') {
    if ('startsWith' in issue.validation) {
      return {
        key: 'errors.string.startsWith',
        params: {
          startsWith: issue.validation.startsWith,
        },
      };
    } else if ('endsWith' in issue.validation) {
      return {
        key: 'errors.string.endsWith',
        params: {
          endsWith: issue.validation.endsWith,
        },
      };
    }

    return {
      key: 'errors.invalid_string.includes',
      params: {
        includes: issue.validation.includes,
      },
    };
  }

  return {
    message: issue.message,
  };
};

const handleTooSmallError = (issue: ZodTooSmallIssue, ctx: ErrorMapCtx) => {
  if (issue.type !== 'string' && issue.type !== 'number') {
    return {
      message: issue.message,
    };
  }

  return {
    key: `errors.tooSmall.${issue.type}`,
    params: {
      minimum: issue.minimum,
      count: issue.minimum,
    },
  };
};

const handleTooBigError = (issue: ZodTooBigIssue, ctx: ErrorMapCtx) => {
  if (issue.type !== 'string' && issue.type !== 'number') {
    return {
      message: issue.message,
    };
  }

  return {
    key: `errors.tooBig.${issue.type}`,
    params: {
      maximum: issue.maximum,
      count: issue.maximum,
    },
  };
};

const handleZodError = (issue: z.ZodIssueOptionalMessage, ctx: ErrorMapCtx) => {
  if (ctx.defaultError === 'Required') {
    return {
      key: 'errors.required',
      params: {},
    };
  }
  if (issue.code === ZodIssueCode.invalid_string) {
    return handleStringError(issue, ctx);
  }
  if (issue.code === ZodIssueCode.too_small) {
    return handleTooSmallError(issue, ctx);
  }
  if (issue.code === ZodIssueCode.too_big) {
    return handleTooBigError(issue, ctx);
  }
  if (issue.code === ZodIssueCode.custom && issue.params?.i18n) {
    return {
      key: `errors.custom.${issue.params.i18n.key}`,
    };
  }

  return {
    message: issue.message,
  };
};

function zodErrorMap(t: TFunction<'zod', undefined, 'zod'>) {
  return (issue: z.ZodIssueOptionalMessage, ctx: ErrorMapCtx) => {
    const error = handleZodError(issue, ctx);
    if ('message' in error && error.message)
      return {
        message: error.message ?? ctx.defaultError,
      };
    return {
      message: t(error.key ?? 'errors.default', error.params ?? {}),
    };
  };
}

export type CustomErrorParams = {
  i18n: {
    key: string;
    params?: Record<string, any>;
  };
};
