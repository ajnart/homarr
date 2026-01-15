import { IconAlignLeft, IconEyeOff, IconGraphFilled, IconListDetails, IconPhoto } from "@tabler/icons-react";

import { objectEntries } from "@homarr/common";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

const labelDisplayModeOptions = {
  textWithIcon: IconListDetails,
  text: IconAlignLeft,
  icon: IconPhoto,
  hidden: IconEyeOff,
} as const;

export const { definition, componentLoader } = createWidgetDefinition("systemResources", {
  icon: IconGraphFilled,
  supportedIntegrations: ["dashDot", "openmediavault", "truenas", "unraid"],
  createOptions() {
    return optionsBuilder.from((factory) => ({
      hasShadow: factory.switch({ defaultValue: true }),
      visibleCharts: factory.multiSelect({
        options: (["cpu", "memory", "network"] as const).map((key) => ({
          value: key,
          label: (t) => t(`widget.systemResources.option.visibleCharts.option.${key}`),
        })),
        defaultValue: ["cpu", "memory", "network"],
        withDescription: true,
      }),
      labelDisplayMode: factory.select({
        options: objectEntries(labelDisplayModeOptions).map(([key, icon]) => ({
          value: key,
          label: (t) => t(`widget.systemResources.option.labelDisplayMode.option.${key}`),
          icon,
        })),
        defaultValue: "textWithIcon",
      }),
    }));
  },
}).withDynamicImport(() => import("./component"));

export type LabelDisplayModeOption = ReturnType<
  (typeof definition)["createOptions"]
>["labelDisplayMode"]["options"][number]["value"];
