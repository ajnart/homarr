import { IconCalendar } from "@tabler/icons-react";
import { z } from "zod/v4";

import { getIntegrationKindsByCategory } from "@homarr/definitions";
import { radarrReleaseTypes } from "@homarr/integrations/types";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

export const { definition, componentLoader } = createWidgetDefinition("calendar", {
  icon: IconCalendar,
  createOptions() {
    return optionsBuilder.from((factory) => ({
      releaseType: factory.multiSelect({
        defaultValue: ["inCinemas", "digitalRelease"],
        options: radarrReleaseTypes.map((value) => ({
          value,
          label: (t) => t(`widget.calendar.option.releaseType.options.${value}`),
        })),
      }),
      filterPastMonths: factory.number({
        validate: z.number().min(2).max(9999),
        defaultValue: 2,
      }),
      filterFutureMonths: factory.number({
        validate: z.number().min(2).max(9999),
        defaultValue: 2,
      }),
      showUnmonitored: factory.switch({
        defaultValue: false,
      }),
    }));
  },
  supportedIntegrations: getIntegrationKindsByCategory("calendar"),
  integrationsRequired: false,
}).withDynamicImport(() => import("./component"));
