import { z } from 'zod';

export const objectKeys = <T extends object>(
  obj: T
): (keyof T extends infer U
  ? U extends string
    ? U
    : U extends number
    ? `${U}`
    : never
  : never)[] => {
  return Object.keys(obj) as any;
};

export const objectEntries = <T extends {}>(object: T): ReadonlyArray<Entry<T>> => {
  return Object.entries(object) as unknown as ReadonlyArray<Entry<T>>;
};

type TupleEntry<
  T extends readonly unknown[],
  I extends unknown[] = [],
  R = never,
> = T extends readonly [infer Head, ...infer Tail]
  ? TupleEntry<Tail, [...I, unknown], R | [`${I['length']}`, Head]>
  : R;

type ObjectEntry<T extends {}> =
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object
    ? { [K in keyof T]: [K, Required<T>[K]] }[keyof T] extends infer E
      ? E extends [infer K, infer V]
        ? K extends string | number
          ? [`${K}`, V]
          : never
        : never
      : never
    : never;

export type Entry<T extends {}> = T extends readonly [unknown, ...unknown[]]
  ? TupleEntry<T>
  : T extends ReadonlyArray<infer U>
  ? [`${number}`, U]
  : ObjectEntry<T>;

export const zodEnumFromObjKeys = <K extends string>(
  obj: Record<K, any>
): z.ZodEnum<[K, ...K[]]> => {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[];
  return z.enum([firstKey, ...otherKeys]);
};
