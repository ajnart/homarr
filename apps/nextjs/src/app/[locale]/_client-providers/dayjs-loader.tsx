"use client";

import type { PropsWithChildren } from "react";

import { useSuspenseDayJsLocalization } from "@homarr/translation/dayjs";

export const DayJsLoader = ({ children }: PropsWithChildren) => {
  // Load the dayjs localization for the current locale with suspense
  useSuspenseDayJsLocalization();

  return children;
};
