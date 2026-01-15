import proxmoxApi from "proxmox-api";
import type { fetch as undiciFetch } from "undici";
import { Response } from "undici";
import { describe, expect, test } from "vitest";

import { IntegrationRequestError } from "../../base/errors/http/integration-request-error";
import { IntegrationResponseError } from "../../base/errors/http/integration-response-error";
import { ProxmoxApiErrorHandler } from "../proxmox-error-handler";

describe("ProxmoxApiErrorHandler handleError should handle the provided error accordingly", () => {
  test.each([400, 401, 500])("should handle %s error", async (statusCode) => {
    // Arrange
    // eslint-disable-next-line no-restricted-syntax
    const mockedFetch: typeof undiciFetch = async () => {
      return Promise.resolve(createFakeResponse(statusCode));
    };

    // Act
    const result = await runWithAsync(mockedFetch);

    // Assert
    expect(result).toBeInstanceOf(IntegrationResponseError);
    const error = result as unknown as IntegrationResponseError;
    expect(error.cause.statusCode).toBe(statusCode);
  });
  test("should handle other non successful status codes", async () => {
    // Arrange
    // eslint-disable-next-line no-restricted-syntax
    const mockedFetch: typeof undiciFetch = async () => {
      return Promise.resolve(createFakeResponse(404));
    };

    // Act
    const result = await runWithAsync(mockedFetch);

    // Assert
    expect(result).toBeInstanceOf(IntegrationResponseError);
    const error = result as unknown as IntegrationResponseError;
    expect(error.cause.statusCode).toBe(404);
  });
  test("should handle request error", async () => {
    // Arrange
    const mockedFetch: typeof undiciFetch = () => {
      const errorWithCode = new Error("Inner error") as Error & { code: string };
      errorWithCode.code = "ECONNREFUSED";
      throw new TypeError("Outer error", { cause: errorWithCode });
    };

    // Act
    const result = await runWithAsync(mockedFetch);

    // Assert
    // In the end in should have the structure IntegrationRequestError -> RequestError -> TypeError -> Error (with code)
    expect(result).toBeInstanceOf(IntegrationRequestError);
    const error = result as unknown as IntegrationRequestError;
    expect(error.cause.cause).toBeInstanceOf(TypeError);
    expect(error.cause.cause?.message).toBe("Outer error");
    expect(error.cause.cause?.cause).toBeInstanceOf(Error);
    const cause = error.cause.cause?.cause as Error & { code: string };
    expect(cause.message).toBe("Inner error");
    expect(cause.code).toBe("ECONNREFUSED");
  });
});

const createFakeResponse = (statusCode: number) => {
  return new Response(JSON.stringify({ data: {} }), {
    status: statusCode,
    // It expects a content-type and valid json response
    // https://github.com/UrielCh/proxmox-api/blob/master/api/src/ProxmoxEngine.ts#L258
    headers: { "content-type": "application/json;charset=UTF-8" },
  });
};

const runWithAsync = async (mockedFetch: typeof undiciFetch) => {
  const integration = { id: "test", name: "test", url: "http://proxmox.example.com" };
  const client = createProxmoxClient(mockedFetch);
  const handler = new ProxmoxApiErrorHandler();

  return await client.nodes.$get().catch((error) => handler.handleError(error, integration));
};

const createProxmoxClient = (fetch: typeof undiciFetch) => {
  return proxmoxApi({
    host: "proxmox.example.com",
    tokenID: "username@realm!tokenId",
    tokenSecret: crypto.randomUUID(),
    fetch,
  });
};
