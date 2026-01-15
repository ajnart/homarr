import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { describe, expect, test } from "vitest";

import { createRedirectUri } from "../redirect";

describe("redirect", () => {
  test("Callback should return http url when not defining protocol", () => {
    // Arrange
    const headers = new Map<string, string>([["x-forwarded-host", "localhost:3000"]]) as unknown as ReadonlyHeaders;

    // Act
    const result = createRedirectUri(headers, "/api/auth/callback/oidc");

    // Assert
    expect(result).toBe("http://localhost:3000/api/auth/callback/oidc");
  });

  test("Callback should return https url when defining protocol", () => {
    // Arrange
    const headers = new Map<string, string>([
      ["x-forwarded-proto", "https"],
      ["x-forwarded-host", "localhost:3000"],
    ]) as unknown as ReadonlyHeaders;

    // Act
    const result = createRedirectUri(headers, "/api/auth/callback/oidc");

    // Assert
    expect(result).toBe("https://localhost:3000/api/auth/callback/oidc");
  });

  test("Callback should return https url when defining protocol and host", () => {
    // Arrange
    const headers = new Map<string, string>([
      ["x-forwarded-proto", "https"],
      ["host", "something.else"],
    ]) as unknown as ReadonlyHeaders;

    // Act
    const result = createRedirectUri(headers, "/api/auth/callback/oidc");

    // Assert
    expect(result).toBe("https://something.else/api/auth/callback/oidc");
  });

  test("Callback should return https url when defining protocol as http,https and host", () => {
    // Arrange
    const headers = new Map<string, string>([
      ["x-forwarded-proto", "http,https"],
      ["x-forwarded-host", "hello.world"],
    ]) as unknown as ReadonlyHeaders;

    // Act
    const result = createRedirectUri(headers, "/api/auth/callback/oidc");

    // Assert
    expect(result).toBe("https://hello.world/api/auth/callback/oidc");
  });
});
