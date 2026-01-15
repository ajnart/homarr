export const logLevels = ["error", "warn", "info", "debug"] as const;
export type LogLevel = (typeof logLevels)[number];

export const logLevelConfiguration = {
  error: {
    prefix: "🔴",
  },
  warn: {
    prefix: "🟡",
  },
  info: {
    prefix: "🟢",
  },
  debug: {
    prefix: "🔵",
  },
} satisfies Record<LogLevel, { prefix: string }>;
