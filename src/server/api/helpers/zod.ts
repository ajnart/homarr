import { z } from 'zod';

type AddLiteralType<TArray> = TArray extends readonly [infer First, ...infer Others]
  ? Others extends []
    ? [z.ZodLiteral<First>]
    : [z.ZodLiteral<First>, ...AddLiteralType<Others>]
  : never;

export const zodUnionLiteralsFromReadonlyStringArray = <TArray extends readonly string[]>(
  array: TArray
) => array.map((v) => z.literal(v)) as AddLiteralType<TArray>;
