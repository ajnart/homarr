import { createTheme } from "@mantine/core";

import { primaryColor } from "./theme/colors/primary";
import { secondaryColor } from "./theme/colors/secondary";

export const theme = createTheme({
  colors: {
    primaryColor,
    secondaryColor,
  },
  primaryColor: "primaryColor",
});
