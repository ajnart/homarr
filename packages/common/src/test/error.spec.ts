import { describe, expect, test } from "vitest";

import { extractErrorMessage } from "../error";

describe("error to resolve to correct message", () => {
  test("error class to resolve to error message", () => {
    // Arrange
    const error = new Error("Message");

    // Act
    const message = extractErrorMessage(error);

    // Assert
    expect(typeof message).toBe("string");
    expect(message).toBe("Message");
  });

  test("error string to resolve to error message", () => {
    // Arrange
    const error = "Message";

    // Act
    const message = extractErrorMessage(error);

    // Assert
    expect(typeof message).toBe("string");
    expect(message).toBe("Message");
  });

  test("error whatever to resolve to unknown error message", () => {
    // Arrange
    const error = 5;

    // Act
    const message = extractErrorMessage(error);

    // Assert
    expect(typeof message).toBe("string");
    expect(message).toBe("Unknown error");
  });
});
