import { describe, expect, test } from "vitest";
import { z } from "zod/v4";

import type { TranslationFunction } from "@homarr/translation";

import { createCustomErrorParams, zodErrorMap } from "./i18n";

const expectError = (error: z.core.$ZodIssue, key: string) => {
  expect(error.message).toContain(key);
};

describe("i18n", () => {
  const t = ((key: string) => {
    return `${key}`;
  }) as TranslationFunction;
  z.config({
    customError: zodErrorMap(t),
  });

  test("should return required error for string when passing null", () => {
    const schema = z.string();
    const result = schema.safeParse(null);
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "required");
  });
  test("should return required error for empty string", () => {
    const schema = z.string().nonempty();
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "required");
  });
  test("should return invalid email error", () => {
    const schema = z.string().email();
    const result = schema.safeParse("invalid-email");
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "invalidEmail");
  });
  test("should return startsWith error", () => {
    const schema = z.string().startsWith("test");
    const result = schema.safeParse("invalid");
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "startsWith");
  });
  test("should return endsWith error", () => {
    const schema = z.string().endsWith("test");
    const result = schema.safeParse("invalid");
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "endsWith");
  });
  test("should return includes error", () => {
    const schema = z.string().includes("test");
    const result = schema.safeParse("invalid");
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "includes");
  });
  test("should return tooSmall error for string", () => {
    const schema = z.string().min(5);
    const result = schema.safeParse("test");
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "tooSmall.string");
  });
  test("should return tooSmall error for number", () => {
    const schema = z.number().min(5);
    const result = schema.safeParse(3);
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "tooSmall.number");
  });
  test("should return tooBig error for string", () => {
    const schema = z.string().max(5);
    const result = schema.safeParse("too long");
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "tooBig.string");
  });
  test("should return tooBig error for number", () => {
    const schema = z.number().max(5);
    const result = schema.safeParse(10);
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "tooBig.number");
  });
  test("should return custom error", () => {
    const schema = z.string().refine((val) => val === "valid", {
      params: createCustomErrorParams({
        key: "boardAlreadyExists",
        params: {},
      }),
    });

    const result = schema.safeParse("invalid");
    expect(result.success).toBe(false);
    if (result.success) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectError(result.error.issues[0]!, "boardAlreadyExists");
  });
});
