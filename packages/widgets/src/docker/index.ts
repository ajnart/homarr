import { IconBrandDocker, IconServerOff } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

const columnsList = [
  "name",
  "state",
  "cpuUsage",
  "memoryUsage",
] as const satisfies (keyof RouterOutputs["docker"]["getContainers"]["containers"][number])[];

export const { definition, componentLoader } = createWidgetDefinition("dockerContainers", {
  icon: IconBrandDocker,
  createOptions() {
    return optionsBuilder.from((factory) => ({
      enableRowSorting: factory.switch({
        defaultValue: false,
      }),
      defaultSort: factory.select({
        defaultValue: "name",
        options: columnsList.map((value) => ({
          value,
          label: (t) => t(`widget.dockerContainers.option.defaultSort.option.${value}`),
        })),
      }),
      descendingDefaultSort: factory.switch({
        defaultValue: false,
      }),
    }));
  },
  errors: {
    INTERNAL_SERVER_ERROR: {
      icon: IconServerOff,
      message: (t) => t("widget.dockerContainers.error.internalServerError"),
    },
  },
}).withDynamicImport(() => import("./component"));
