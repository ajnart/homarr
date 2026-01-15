"use client";

import type { PropsWithChildren } from "react";
import { Provider } from "jotai";

export const JotaiProvider = ({ children }: PropsWithChildren) => {
  return <Provider>{children}</Provider>;
};
