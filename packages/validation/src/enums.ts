import { z } from "zod/v4";

type CouldBeReadonlyArray<T> = T[] | readonly T[];

export const zodEnumFromArray = <T extends string>(array: CouldBeReadonlyArray<T>) =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  z.enum([array[0]!, ...array.slice(1)]);

export const zodUnionFromArray = <T extends z.ZodType>(array: CouldBeReadonlyArray<T>) =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  z.union([array[0]!, array[1]!, ...array.slice(2)]);
