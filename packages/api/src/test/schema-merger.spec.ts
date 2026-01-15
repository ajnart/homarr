import { describe, expect, test } from "vitest";
import z from "zod/v4";

import { convertIntersectionToZodObject } from "../schema-merger";

describe("convertIntersectionToZodObject should convert zod intersection to zod object", () => {
  test("should merge two ZodObjects with different properties", () => {
    const objectA = z.object({
      id: z.string(),
    });
    const objectB = z.object({
      name: z.string(),
    });

    const intersection = objectA.and(objectB);

    const result = convertIntersectionToZodObject(intersection);

    expect(result.def.type).toBe("object");
    expect(result.shape).toHaveProperty("id");
    expect(result.shape).toHaveProperty("name");
  });
});
