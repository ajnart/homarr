import { IconServerOff, IconTopologyFull } from "@tabler/icons-react";

import { getIntegrationKindsByCategory } from "@homarr/definitions";

import { createWidgetDefinition } from "../../definition";
import { optionsBuilder } from "../../options";

export const { definition, componentLoader } = createWidgetDefinition("networkControllerStatus", {
  icon: IconTopologyFull,
  createOptions() {
    return optionsBuilder.from((factory) => ({
      content: factory.select({
        options: (["wifi", "wired"] as const).map((value) => ({
          value,
          label: (t) => t(`widget.networkControllerStatus.option.content.option.${value}.label`),
        })),
        defaultValue: "wifi",
      }),
    }));
  },
  supportedIntegrations: getIntegrationKindsByCategory("networkController"),
  errors: {
    INTERNAL_SERVER_ERROR: {
      icon: IconServerOff,
      message: (t) => t("widget.networkController.error.internalServerError"),
    },
  },
}).withDynamicImport(() => import("./component"));
