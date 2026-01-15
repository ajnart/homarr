import { IconTicket } from "@tabler/icons-react";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

export const { definition, componentLoader } = createWidgetDefinition("mediaReleases", {
  icon: IconTicket,
  createOptions() {
    return optionsBuilder.from((factory) => ({
      layout: factory.select({
        defaultValue: "backdrop",
        options: [
          {
            value: "backdrop",
            label: (t) => t("widget.mediaReleases.option.layout.option.backdrop.label"),
          },
          {
            value: "poster",
            label: (t) => t("widget.mediaReleases.option.layout.option.poster.label"),
          },
        ],
      }),
      showDescriptionTooltip: factory.switch({
        defaultValue: true,
      }),
      showType: factory.switch({
        defaultValue: true,
      }),
      showSource: factory.switch({
        defaultValue: true,
      }),
    }));
  },
  supportedIntegrations: ["mock", "emby", "jellyfin", "plex"],
}).withDynamicImport(() => import("./component"));
