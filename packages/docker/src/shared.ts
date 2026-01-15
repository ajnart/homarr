import type { MantineColor } from "@mantine/core";

import type { ContainerState } from ".";

export const containerStateColorMap = {
  created: "cyan",
  running: "green",
  paused: "yellow",
  restarting: "orange",
  exited: "red",
  removing: "pink",
  dead: "dark",
} satisfies Record<ContainerState, MantineColor>;
