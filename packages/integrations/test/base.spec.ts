import { describe, expect, test, vi } from "vitest";

import { ResponseError } from "@homarr/common/server";
import { createDb } from "@homarr/db/test";

import type { IntegrationTestingInput } from "../src/base/integration";
import { Integration } from "../src/base/integration";
import type { TestingResult } from "../src/base/test-connection/test-connection-service";

vi.mock("@homarr/db", async (importActual) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importActual<typeof import("@homarr/db")>();
  return {
    ...actual,
    db: createDb(),
  };
});

vi.mock("@homarr/core/infrastructure/certificates", async (importActual) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importActual<typeof import("@homarr/core/infrastructure/certificates")>();
  return {
    ...actual,
    getTrustedCertificateHostnamesAsync: vi.fn().mockImplementation(() => {
      return Promise.resolve([]);
    }),
  };
});

describe("Base integration", () => {
  test("testConnectionAsync should handle errors", async () => {
    const responseError = new ResponseError({ status: 500, url: "https://example.com" });
    const integration = new FakeIntegration(undefined, responseError);

    const result = await integration.testConnectionAsync();

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type === "statusCode").toBe(true);
    if (result.error.type !== "statusCode") return;
    expect(result.error.data.statusCode).toBe(500);
    expect(result.error.data.url).toContain("https://example.com");
    expect(result.error.data.reason).toBe("internalServerError");
  });
});

class FakeIntegration extends Integration {
  constructor(
    private testingResult?: TestingResult,
    private error?: Error,
  ) {
    super({
      id: "test",
      name: "Test",
      url: "https://example.com",
      decryptedSecrets: [],
      externalUrl: null,
    });
  }

  // eslint-disable-next-line no-restricted-syntax
  protected testingAsync(_: IntegrationTestingInput): Promise<TestingResult> {
    if (this.error) {
      return Promise.reject(this.error);
    }

    return Promise.resolve(this.testingResult ?? { success: true });
  }
}
