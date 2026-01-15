import { IconAd, IconServerOff } from "@tabler/icons-react";

import { getIntegrationKindsByCategory } from "@homarr/definitions";

import { createWidgetDefinition } from "../../definition";
import { optionsBuilder } from "../../options";

export const widgetKind = "dnsHoleSummary";

export const { definition, componentLoader } = createWidgetDefinition(widgetKind, {
  icon: IconAd,
  createOptions() {
    return optionsBuilder.from((factory) => ({
      usePiHoleColors: factory.switch({
        defaultValue: true,
      }),
      layout: factory.select({
        options: (["grid", "row", "column"] as const).map((value) => ({
          value,
          label: (t) => t(`widget.dnsHoleSummary.option.layout.option.${value}.label`),
        })),
        defaultValue: "grid",
      }),
    }));
  },
  supportedIntegrations: getIntegrationKindsByCategory("dnsHole"),
  errors: {
    INTERNAL_SERVER_ERROR: {
      icon: IconServerOff,
      message: (t) => t("widget.dnsHoleSummary.error.internalServerError"),
    },
  },
}).withDynamicImport(() => import("./component"));
