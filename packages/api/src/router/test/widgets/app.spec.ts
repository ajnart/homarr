import { describe, expect, test, vi } from "vitest";

import type { Session } from "@homarr/auth";
import { createDb } from "@homarr/db/test";
import * as ping from "@homarr/ping";

import { appRouter } from "../../widgets/app";

// Mock the auth module to return an empty session
vi.mock("@homarr/auth", () => ({ auth: () => ({}) as Session }));
vi.mock("@homarr/ping", () => ({ sendPingRequestAsync: async () => await Promise.resolve(null) }));

describe("ping should call sendPingRequestAsync with url and return result", () => {
  test("ping with error response should return error and url", async () => {
    // Arrange
    const spy = vi.spyOn(ping, "sendPingRequestAsync");
    const url = "http://localhost";
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: null,
    });
    spy.mockImplementation(() => Promise.resolve({ error: "error" }));

    // Act
    const result = await caller.ping({ url });

    // Assert
    expect(result.url).toBe(url);
    expect("error" in result).toBe(true);
  });

  test("ping with success response should return statusCode and url", async () => {
    // Arrange
    const spy = vi.spyOn(ping, "sendPingRequestAsync");
    const url = "http://localhost";
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: null,
    });
    spy.mockImplementation(() => Promise.resolve({ statusCode: 200, durationMs: 123 }));

    // Act
    const result = await caller.ping({ url });

    // Assert
    expect(result.url).toBe(url);
    expect("statusCode" in result).toBe(true);
  });
});
