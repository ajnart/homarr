import { describe, expect, test } from "vitest";

import { getPortFromUrl } from "../url";

describe("getPortFromUrl", () => {
  test.each([
    [80, "http"],
    [443, "https"],
  ])("should return %s for %s protocol without port", (expectedPort, protocol) => {
    // Arrange
    const url = new URL(`${protocol}://example.com`);

    // Act
    const port = getPortFromUrl(url);

    // Assert
    expect(port).toBe(expectedPort);
  });
  test.each([["http"], ["https"], ["anything"]])("should return the specified port for %s protocol", (protocol) => {
    // Arrange
    const expectedPort = 3000;
    const url = new URL(`${protocol}://example.com:${expectedPort}`);

    // Act
    const port = getPortFromUrl(url);

    // Assert
    expect(port).toBe(expectedPort);
  });
  test("should throw an error for unsupported protocol", () => {
    // Arrange
    const url = new URL("ftp://example.com");

    // Act
    const act = () => getPortFromUrl(url);

    // Act & Assert
    expect(act).toThrowError("Unsupported protocol: ftp:");
  });
});
