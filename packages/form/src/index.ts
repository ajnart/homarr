import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import type { ZodDiscriminatedUnion, ZodIntersection, ZodObject, ZodPipe } from "zod/v4";
import { z } from "zod/v4";

import { useI18n } from "@homarr/translation/client";
import { zodErrorMap } from "@homarr/validation/form/i18n";

type inferPossibleSchema<
  TSchema extends
    | ZodObject
    | ZodPipe<ZodObject>
    | ZodIntersection<ZodObject | ZodDiscriminatedUnion<ZodObject[]>, ZodObject>,
> = z.infer<TSchema> extends Record<string, unknown> ? z.infer<TSchema> : never;

export const useZodForm = <
  TSchema extends
    | ZodObject
    | ZodPipe<ZodObject>
    | ZodIntersection<ZodObject | ZodDiscriminatedUnion<ZodObject[]>, ZodObject>,
>(
  schema: TSchema,
  options: Omit<
    Exclude<Parameters<typeof useForm<inferPossibleSchema<TSchema>>>[0], undefined>,
    "validate" | "validateInputOnBlur" | "validateInputOnChange"
  >,
) => {
  const t = useI18n();

  z.config({
    customError: zodErrorMap(t),
  });
  return useForm<inferPossibleSchema<TSchema>>({
    ...options,
    validateInputOnBlur: true,
    validateInputOnChange: true,
    validate: zod4Resolver(schema),
  });
};
