import type { ILogger } from "@homarr/core/infrastructure/logs";
import type { LogLevel } from "@homarr/core/infrastructure/logs/constants";

interface LogMessage {
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

interface LogError {
  level: LogLevel;
  error: unknown;
}

type LogEntry = LogMessage | LogError;

export class TestLogger implements ILogger {
  public entries: LogEntry[] = [];
  public get messages(): LogMessage[] {
    return this.entries.filter((entry) => "message" in entry);
  }
  public get errors(): LogError[] {
    return this.entries.filter((entry) => "error" in entry);
  }

  private log(level: LogLevel, param1: unknown, param2?: Record<string, unknown>): void {
    if (typeof param1 === "string") {
      this.entries.push({ level, message: param1, meta: param2 });
    } else {
      this.entries.push({ level, error: param1 });
    }
  }

  debug(param1: unknown, param2?: Record<string, unknown>): void {
    this.log("debug", param1, param2);
  }

  info(param1: unknown, param2?: Record<string, unknown>): void {
    this.log("info", param1, param2);
  }

  warn(param1: unknown, param2?: Record<string, unknown>): void {
    this.log("warn", param1, param2);
  }

  error(param1: unknown, param2?: Record<string, unknown>): void {
    this.log("error", param1, param2);
  }
}
