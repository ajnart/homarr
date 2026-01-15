import type { z } from "zod/v4";

export type MaybePromise<T> = T | Promise<T>;

export type AtLeastOneOf<T> = [T, ...T[]];

export type Modify<T, R extends Partial<Record<keyof T, unknown>>> = {
  [P in keyof (Omit<T, keyof R> & R)]: (Omit<T, keyof R> & R)[P];
};

export type RemoveReadonly<T> = {
  -readonly [P in keyof T]: T[P] extends Record<string, unknown> ? RemoveReadonly<T[P]> : T[P];
};

export type MaybeArray<T> = T | T[];
export type Inverse<T extends Invertible> = {
  [Key in keyof T as T[Key]]: Key;
};

type Invertible = Record<PropertyKey, PropertyKey>;

export type inferSearchParamsFromSchema<TSchema extends z.ZodObject> = inferSearchParamsFromSchemaInner<
  z.infer<TSchema>
>;

type inferSearchParamsFromSchemaInner<TSchema extends Record<string, unknown>> = Partial<{
  [K in keyof TSchema]: Exclude<TSchema[K], undefined> extends unknown[] ? string[] : string;
}>;
