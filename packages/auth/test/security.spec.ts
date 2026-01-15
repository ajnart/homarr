import { describe, expect, it } from "vitest";

import { createSaltAsync, hashPasswordAsync } from "../security";

describe("createSalt should return a salt", () => {
  it("should return a salt", async () => {
    const result = await createSaltAsync();
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(25);
  });
  it("should return a different salt each time", async () => {
    const result1 = await createSaltAsync();
    const result2 = await createSaltAsync();
    expect(result1).not.toEqual(result2);
  });
});

describe("hashPassword should return a hash", () => {
  it("should return a hash", async () => {
    const password = "password";
    const salt = await createSaltAsync();
    const result = await hashPasswordAsync(password, salt);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(55);
    expect(result).not.toEqual(password);
  });
  it("should return a different hash each time", async () => {
    const password = "password";
    const password2 = "another password";
    const salt = await createSaltAsync();

    const result1 = await hashPasswordAsync(password, salt);
    const result2 = await hashPasswordAsync(password2, salt);

    expect(result1).not.toEqual(result2);
  });
  it("should return a different hash for the same password with different salts", async () => {
    const password = "password";
    const salt1 = await createSaltAsync();
    const salt2 = await createSaltAsync();

    const result1 = await hashPasswordAsync(password, salt1);
    const result2 = await hashPasswordAsync(password, salt2);

    expect(result1).not.toEqual(result2);
  });
});
