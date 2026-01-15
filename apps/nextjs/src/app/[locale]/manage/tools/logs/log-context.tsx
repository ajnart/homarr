"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";

import type { LogLevel } from "@homarr/core/infrastructure/logs/constants";
import { logLevels } from "@homarr/core/infrastructure/logs/constants";

const LogContext = createContext<{
  level: LogLevel;
  setLevel: (level: LogLevel) => void;
  activeLevels: LogLevel[];
} | null>(null);

interface LogContextProviderProps extends PropsWithChildren {
  defaultLevel: LogLevel;
}

export const LogContextProvider = ({ defaultLevel, children }: LogContextProviderProps) => {
  const [level, setLevel] = useState(defaultLevel);
  const activeLevels = useMemo(() => logLevels.slice(0, logLevels.indexOf(level) + 1), [level]);

  return <LogContext.Provider value={{ level, setLevel, activeLevels }}>{children}</LogContext.Provider>;
};

export const useLogContext = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLogContext must be used within a LogContextProvider");
  }
  return context;
};
