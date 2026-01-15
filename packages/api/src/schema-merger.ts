import { z } from "zod/v4";
import type { ZodIntersection, ZodObject } from "zod/v4";

export function convertIntersectionToZodObject<TIntersection extends ZodIntersection<ZodObject, ZodObject>>(
  intersection: TIntersection,
) {
  const left = intersection.def.left;
  const right = intersection.def.right;

  // Merge the shapes
  const mergedShape = { ...left.def.shape, ...right.def.shape };

  // Return a new ZodObject
  return z.object(mergedShape) as unknown as TIntersection extends ZodIntersection<infer TLeft, infer TRight>
    ? TLeft extends ZodObject
      ? TRight extends ZodObject
        ? ZodObject<TLeft["shape"] & TRight["shape"]>
        : never
      : never
    : never;
}
