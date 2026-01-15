import type { Dispatcher } from "undici";
import { describe, expect, test, vi } from "vitest";

import { UndiciHttpAgent } from "@homarr/core/infrastructure/http";

import { TestLogger } from "../logs";

vi.mock("undici", () => {
  return {
    EnvHttpProxyAgent: class EnvHttpProxyAgent {
      dispatch(_options: Dispatcher.DispatchOptions, _handler: Dispatcher.DispatchHandler): boolean {
        return true;
      }
    },
    setGlobalDispatcher: () => undefined,
  };
});

const REDACTED = "REDACTED";

describe("UndiciHttpAgent should log all requests", () => {
  test("should log all requests", () => {
    // Arrange
    const logger = new TestLogger();
    const agent = new UndiciHttpAgent({ logger });

    // Act
    agent.dispatch({ origin: "https://homarr.dev", path: "/", method: "GET" }, {});

    // Assert
    expect(logger.messages).toContainEqual({
      level: "debug",
      message: "Dispatching request https://homarr.dev/ (0 headers)",
    });
  });

  test("should show amount of headers", () => {
    // Arrange
    const logger = new TestLogger();
    const agent = new UndiciHttpAgent({ logger });

    // Act
    agent.dispatch(
      {
        origin: "https://homarr.dev",
        path: "/",
        method: "GET",
        headers: {
          "Content-Type": "text/html",
          "User-Agent": "Mozilla/5.0",
        },
      },
      {},
    );

    // Assert
    expect(logger.messages.at(-1)?.message).toContain("(2 headers)");
  });

  test.each([
    ["/?hex=a3815e8ada2ef9a31", `/?hex=${REDACTED}`],
    ["/?uuid=f7c3f65e-c511-4f90-ba9a-3fd31418bd49", `/?uuid=${REDACTED}`],
    ["/?password=complexPassword123", `/?password=${REDACTED}`],
    [
      // JWT for John Doe
      "/?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      `/?jwt=${REDACTED}`,
    ],
    ["/?one=a1&two=b2&three=c3", `/?one=${REDACTED}&two=${REDACTED}&three=${REDACTED}`],
    ["/?numberWith13Chars=1234567890123", `/?numberWith13Chars=${REDACTED}`],
    [`/?stringWith13Chars=${"a".repeat(13)}`, `/?stringWith13Chars=${REDACTED}`],
    [`/${"a".repeat(32)}/?param=123`, `/${REDACTED}/?param=123`],
  ])("should redact sensitive data in url https://homarr.dev%s", (path, expected) => {
    // Arrange
    const logger = new TestLogger();
    const agent = new UndiciHttpAgent({ logger });

    // Act
    agent.dispatch({ origin: "https://homarr.dev", path, method: "GET" }, {});

    // Assert
    expect(logger.messages.at(-1)?.message).toContain(` https://homarr.dev${expected} `);
  });
  test.each([
    ["empty", "/?empty"],
    ["numbers with max 12 chars", "/?number=123456789012"],
    ["true", "/?true=true"],
    ["false", "/?false=false"],
    ["strings with max 12 chars", `/?short=${"a".repeat(12)}`],
    ["dates", "/?date=2022-01-01"],
    ["date times", "/?datetime=2022-01-01T00:00:00.000Z"],
  ])("should not redact values that are %s", (_reason, path) => {
    // Arrange
    const logger = new TestLogger();
    const agent = new UndiciHttpAgent({ logger });

    // Act
    agent.dispatch({ origin: "https://homarr.dev", path, method: "GET" }, {});

    // Assert
    expect(logger.messages.at(-1)?.message).toContain(` https://homarr.dev${path} `);
  });
});
