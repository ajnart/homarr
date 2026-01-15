export interface Logger {
  logDebug(message: string, metadata?: Record<string, unknown>): void;
  logInfo(message: string, metadata?: Record<string, unknown>): void;
  logError(message: string, metadata?: Record<string, unknown>): void;
  logError(error: unknown): void;
  logWarning(message: string, metadata?: Record<string, unknown>): void;
}
