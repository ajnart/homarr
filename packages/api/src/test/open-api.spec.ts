import { expect, test, vi } from "vitest";

import { openApiDocument } from "../open-api";

vi.mock("@homarr/auth", () => ({}));

test("OpenAPI documentation should be generated", () => {
  // Arrange
  const base = "https://homarr.dev";

  // Act
  const act = () => openApiDocument(base);

  // Assert
  expect(act).not.toThrow();
});
