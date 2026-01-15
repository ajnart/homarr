import { describe, expect, test } from "vitest";

import { createHomarrContainer } from "./shared/create-homarr-container";

describe("Home", () => {
  test("should open with status code 200", async () => {
    // Arrange
    const homarrContainer = await createHomarrContainer().start();

    // Act
    const homeResponse = await fetch(`http://localhost:${homarrContainer.getMappedPort(7575)}/`);

    // Assert
    expect(homeResponse.status).toBe(200);
  }, 20_000);
});
