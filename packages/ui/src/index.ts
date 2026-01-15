import type { MantineProviderProps } from "@mantine/core";

import { theme } from "./theme";

export * from "./components";

export const uiConfiguration = {
  theme,
} satisfies MantineProviderProps;
